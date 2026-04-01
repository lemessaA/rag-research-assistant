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
      content: "Welcome to your research assistant. Upload documents and ask questions to get started.",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<ResearchMode>('research');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
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

  const { suggestions, contextualPrompts, continuationSuggestions, topicSuggestions, categorizedSuggestions } = useSmartSuggestions(suggestionContext);

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
      
      // Scroll to show new suggestions
      setTimeout(() => {
        scrollToBottom();
      }, 100);
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-160px)] flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Research Chat</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connected</span>
          </div>
        </div>
        <select
          value={selectedMode}
          onChange={(e) => setSelectedMode(e.target.value as ResearchMode)}
          className="w-full p-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {RESEARCH_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label} - {mode.description}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-4xl rounded-lg p-4 ${
              message.type === 'user'
                ? 'bg-blue-600 text-white'
                : message.type === 'system'
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'bg-gray-50 text-gray-900 border border-gray-200'
            }`}>
              {message.type === 'user' && selectedModeInfo && (
                <div className="text-xs opacity-75 mb-2">
                  {selectedModeInfo.label} mode
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
                <div className="prose prose-sm max-w-none">
                  {message.content}
                </div>
              )}
              
              {message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Sources:
                  </div>
                  <div className="space-y-2">
                    {message.sources.map((source, index) => (
                      <details key={index} className="group cursor-pointer">
                        <summary className="text-sm font-medium text-blue-600 hover:text-blue-800">
                          {source.title} (Relevance: {(source.score * 100).toFixed(1)}%)
                        </summary>
                        <div className="mt-2 text-sm text-gray-600 bg-white p-3 rounded border">
                          {source.content}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Follow-up Actions (only for latest assistant message) */}
              {message.type === 'assistant' && 
               messages.indexOf(message) === messages.length - 1 && 
               !isLoading &&
               contextualPrompts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-2">Continue conversation:</div>
                  <div className="flex flex-wrap gap-2">
                    {contextualPrompts.slice(0, 3).map((prompt, index) => (
                      <button
                        key={`quick-${index}`}
                        onClick={() => handleSubmit(prompt.text)}
                        disabled={isLoading}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                      >
                        {prompt.text.length > 40 ? prompt.text.substring(0, 37) + '...' : prompt.text}
                      </button>
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

      {/* Continuous Smart Suggestions */}
      {!isLoading && suggestions.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <div className="text-sm font-medium text-gray-700 mb-3">
            {messages.filter(m => m.type === 'user').length === 0 
              ? 'Get started with these questions:'
              : contextualPrompts.length > 0 
                ? 'Continue the conversation:'
                : 'Explore further:'
            }
          </div>
          
          {/* Priority suggestions from conversation context */}
          {contextualPrompts.length > 0 && (
            <div className="space-y-2 mb-3">
              {contextualPrompts.slice(0, 3).map((suggestion, index) => (
                <button
                  key={`contextual-${index}`}
                  onClick={() => handleSubmit(suggestion.text)}
                  disabled={isLoading}
                  className="block w-full text-left text-sm p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 text-blue-800 hover:text-blue-900 transition-colors disabled:opacity-50 font-medium"
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          )}
          
          {/* Additional conversation suggestions */}
          {continuationSuggestions.length > 0 && (
            <div className="space-y-2 mb-3">
              <div className="text-xs text-gray-500 mb-2">Conversation flow:</div>
              {continuationSuggestions.slice(0, 2).map((suggestion, index) => (
                <button
                  key={`continuation-${index}`}
                  onClick={() => handleSubmit(suggestion.text)}
                  disabled={isLoading}
                  className="block w-full text-left text-sm p-2 bg-green-50 hover:bg-green-100 rounded border border-green-200 text-green-700 hover:text-green-800 transition-colors disabled:opacity-50"
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          )}
          
          {/* General suggestions */}
          <div className="space-y-2">
            {(contextualPrompts.length === 0 && continuationSuggestions.length === 0) ? (
              suggestions.slice(0, 4).map((suggestion, index) => (
                <button
                  key={`general-${index}`}
                  onClick={() => handleSubmit(suggestion.text)}
                  disabled={isLoading}
                  className="block w-full text-left text-sm p-2 bg-gray-50 hover:bg-gray-100 rounded border text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                  {suggestion.text}
                </button>
              ))
            ) : (
              suggestions.slice(0, 2).map((suggestion, index) => (
                <button
                  key={`additional-${index}`}
                  onClick={() => handleSubmit(suggestion.text)}
                  disabled={isLoading}
                  className="block w-full text-left text-sm p-2 bg-gray-50 hover:bg-gray-100 rounded border text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 text-opacity-80"
                >
                  {suggestion.text}
                </button>
              ))
            )}
          </div>
          
          {/* Suggestion count indicator */}
          {suggestions.length > 6 && (
            <div className="mt-3 text-xs text-gray-500 text-center">
              +{suggestions.length - 6} more suggestions available
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}