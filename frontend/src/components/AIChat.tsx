'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { api, APIError } from '@/lib/api';
import { ResearchMode, ResearchResponse, UploadedFile } from '@/types';
import { RESEARCH_MODES } from '@/lib/constants';
import { useSmartSuggestions, SuggestionContext } from '@/lib/smartSuggestions';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: ResearchMode;
  sources?: ResearchResponse['sources'];
  thinking?: string;
}

interface AIChatProps {
  uploadedFiles: UploadedFile[];
}

export default function AIChat({ uploadedFiles }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: "Hello! I'm your AI research assistant. I can help you analyze documents, answer questions, and provide intelligent insights. Upload some documents and ask me anything!",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<ResearchMode>('research');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [suggestionPreview, setSuggestionPreview] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Smart Suggestion System
  const suggestionContext: SuggestionContext = useMemo(() => {
    const fileTypes = uploadedFiles.map(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      return extension;
    });

    const now = new Date();
    const hour = now.getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    const lastUserMessage = messages.filter(m => m.type === 'user').slice(-1)[0];

    return {
      uploadedFiles,
      conversationLength: messages.filter(m => m.type === 'user').length,
      lastUserQuestion: lastUserMessage?.content,
      currentMode: selectedMode,
      hasMultipleFiles: uploadedFiles.length > 1,
      fileTypes: [...new Set(fileTypes)],
      timeOfDay: timeOfDay as 'morning' | 'afternoon' | 'evening'
    };
  }, [uploadedFiles, messages, selectedMode]);

  const { suggestions, contextualPrompts, categorizedSuggestions } = useSmartSuggestions(suggestionContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (uploadedFiles.length > 0) {
      const latestFile = uploadedFiles[uploadedFiles.length - 1];
      const systemMessage: ChatMessage = {
        id: `file-${Date.now()}`,
        type: 'system',
        content: `📄 Document processed: ${latestFile.name} (${latestFile.chunksCreated} chunks). I'm ready to answer questions about it!`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, systemMessage]);
    }
  }, [uploadedFiles]);

  const handleSubmit = async (questionText?: string) => {
    const question = questionText || input.trim();
    if (!question || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date().toISOString(),
      mode: selectedMode,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsThinking(true);

    // Add thinking indicator
    const thinkingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      thinking: 'Analyzing your question and searching through documents...',
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const result = await api.research({ question, mode: selectedMode });
      
      // Remove thinking message and add real response
      setMessages(prev => prev.slice(0, -1));
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: result.answer,
        timestamp: new Date().toISOString(),
        sources: result.sources,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => prev.slice(0, -1));
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: error instanceof APIError 
          ? `I encountered an issue: ${error.message}. Please try rephrasing your question or check if I'm properly connected to my knowledge base.`
          : `I'm having trouble connecting to my knowledge base. Please make sure my backend is running and try again.`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  const selectedModeInfo = RESEARCH_MODES.find(mode => mode.value === selectedMode);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 h-[calc(100vh-200px)] flex flex-col">
      {/* AI Mode Selector */}
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <span>🧠</span>
            <span>AI Research Mode</span>
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>AI Active</span>
          </div>
        </div>
        <select
          value={selectedMode}
          onChange={(e) => setSelectedMode(e.target.value as ResearchMode)}
          className="w-full p-2 border border-gray-300 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {RESEARCH_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.icon} {mode.label} - {mode.description}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-4xl rounded-2xl p-4 ${
              message.type === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : message.type === 'system'
                ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border border-green-200'
                : 'bg-gray-50 text-gray-900 border border-gray-200'
            }`}>
              {message.type === 'user' && (
                <div className="flex items-center space-x-2 text-xs opacity-75 mb-2">
                  <span>👤</span>
                  <span>{selectedModeInfo?.label} mode</span>
                </div>
              )}
              
              {message.type === 'assistant' && (
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                  <span>🤖</span>
                  <span>AI Assistant</span>
                </div>
              )}

              {message.thinking ? (
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-sm text-gray-600">{message.thinking}</span>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-gray-800">
                  {message.content}
                </div>
              )}
              
              {message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <span>🔍</span>
                    <span>Sources Found:</span>
                  </div>
                  <div className="space-y-2">
                    {message.sources.map((source, index) => (
                      <details key={index} className="group cursor-pointer">
                        <summary className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-2">
                          <span>📄</span>
                          <span>{source.title} (Relevance: {(source.score * 100).toFixed(1)}%)</span>
                        </summary>
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
                          {source.content}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs opacity-50 mt-2">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Smart Suggestions */}
      {(suggestions.length > 0 || contextualPrompts.length > 0) && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Contextual Follow-up Prompts */}
          {contextualPrompts.length > 0 && messages.filter(m => m.type === 'user').length > 1 && (
            <div>
              <div className="text-sm font-medium text-purple-700 mb-2 flex items-center space-x-2">
                <span>🧠</span>
                <span>Smart Follow-ups:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {contextualPrompts.map((prompt, index) => (
                  <button
                    key={`followup-${index}`}
                    onClick={() => handleSubmit(prompt.text)}
                    disabled={isLoading}
                    className="text-xs px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-pink-200 transition-all duration-200 disabled:opacity-50 flex items-center space-x-1 border border-purple-200"
                  >
                    <span>{prompt.icon}</span>
                    <span>{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Smart Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div className="text-sm font-medium text-blue-700 mb-3 flex items-center space-x-2">
                <span>✨</span>
                <span>AI Suggestions for You:</span>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {selectedMode} mode
                </div>
              </div>
              
              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={`quick-${index}`}
                    onClick={() => handleSubmit(suggestion.text)}
                    disabled={isLoading}
                    className="text-xs px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all duration-200 disabled:opacity-50 flex items-center space-x-1 border border-blue-200 hover:shadow-md"
                  >
                    <span>{suggestion.icon}</span>
                    <span className="max-w-[200px] truncate">{suggestion.text}</span>
                  </button>
                ))}
              </div>

              {/* Categorized Suggestions (if multiple files) */}
              {uploadedFiles.length > 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {categorizedSuggestions.analysis.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600 font-medium">🔍 Analysis</div>
                      {categorizedSuggestions.analysis.slice(0, 1).map((suggestion, index) => (
                        <button
                          key={`analysis-${index}`}
                          onClick={() => handleSubmit(suggestion.text)}
                          disabled={isLoading}
                          className="w-full text-xs p-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-md hover:from-green-100 hover:to-emerald-100 transition-all duration-200 disabled:opacity-50 text-left border border-green-200"
                        >
                          <span className="flex items-start space-x-1">
                            <span>{suggestion.icon}</span>
                            <span className="line-clamp-2">{suggestion.text}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {categorizedSuggestions.comparison.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600 font-medium">⚖️ Compare</div>
                      {categorizedSuggestions.comparison.slice(0, 1).map((suggestion, index) => (
                        <button
                          key={`compare-${index}`}
                          onClick={() => handleSubmit(suggestion.text)}
                          disabled={isLoading}
                          className="w-full text-xs p-2 bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 rounded-md hover:from-yellow-100 hover:to-orange-100 transition-all duration-200 disabled:opacity-50 text-left border border-yellow-200"
                        >
                          <span className="flex items-start space-x-1">
                            <span>{suggestion.icon}</span>
                            <span className="line-clamp-2">{suggestion.text}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Context Hints */}
              <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                💡 Suggestions adapt based on your documents ({uploadedFiles.length} files), conversation, and {selectedMode} mode
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-100 p-4">
        {/* Suggestion Preview */}
        {suggestionPreview && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span>💡</span>
                <span>Suggestion: {suggestionPreview}</span>
              </span>
              <button
                onClick={() => {
                  setInput(suggestionPreview);
                  setSuggestionPreview('');
                  inputRef.current?.focus();
                }}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
              >
                Use
              </button>
            </div>
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="relative">
          <div className="flex space-x-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your documents..."
                className="w-full p-3 pr-12 border border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              
              {/* Floating Suggestion Button */}
              {suggestions.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Show more suggestions"
                >
                  <span className="text-lg">💡</span>
                </button>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>🧠</span>
                </>
              ) : (
                <>
                  <span>Ask AI</span>
                  <span>🚀</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Expanded Suggestions Panel */}
        {showAllSuggestions && (
          <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-blue-800">🎯 All Smart Suggestions</h3>
              <button
                onClick={() => setShowAllSuggestions(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`expanded-${index}`}
                  onClick={() => {
                    handleSubmit(suggestion.text);
                    setShowAllSuggestions(false);
                  }}
                  disabled={isLoading}
                  className="text-left text-sm p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 border border-transparent hover:border-blue-200 group"
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-base group-hover:scale-110 transition-transform">{suggestion.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{suggestion.text}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {suggestion.category} • {suggestion.mode} mode
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Access Suggestions */}
        {!showAllSuggestions && suggestions.length > 0 && input.length === 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {suggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={`quick-access-${index}`}
                onClick={() => setSuggestionPreview(suggestion.text)}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors"
              >
                {suggestion.icon} {suggestion.text.substring(0, 30)}...
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}