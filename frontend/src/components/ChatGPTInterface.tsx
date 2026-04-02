'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { api, APIError } from '@/lib/api';
import { ResearchMode, ResearchResponse, UploadedFile } from '@/types';
import { RESEARCH_MODES, SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
import { useSmartSuggestions, SuggestionContext } from '@/lib/smartSuggestions';
import { useTheme } from '@/contexts/ThemeContext';
import FormattedText from './FormattedText';
import ThemeToggle from './ThemeToggle';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: ResearchMode;
  sources?: ResearchResponse['sources'];
  thinking?: string;
}

interface ChatGPTInterfaceProps {
  uploadedFiles: UploadedFile[];
  onFileUploaded: (file: UploadedFile) => void;
}

export default function ChatGPTInterface({ uploadedFiles, onFileUploaded }: ChatGPTInterfaceProps) {
  const { themeConfig } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<ResearchMode>('research');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      fileTypes: Array.from(new Set(fileTypes)),
      timeOfDay: timeOfDay as 'morning' | 'afternoon' | 'evening'
    };
  }, [uploadedFiles, messages, selectedMode]);

  const { suggestions, contextualPrompts } = useSmartSuggestions(suggestionContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Add thinking indicator
    const thinkingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      thinking: 'Thinking...',
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
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      setMessages(prev => prev.slice(0, -1));
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: error instanceof APIError 
          ? `I encountered an issue: ${error.message}`
          : `I'm having trouble connecting. Please check if the backend is running.`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // File upload handling
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);

    try {
      const result = await api.uploadFile(file);
      
      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        chunksCreated: result.chunks_created,
      };
      
      onFileUploaded(uploadedFile);
      
      // Add AI system message about upload
      const systemMessage: ChatMessage = {
        id: `upload-${Date.now()}`,
        type: 'system',
        content: `AI successfully processed "${file.name}" into ${result.chunks_created} knowledge chunks. Ready for intelligent analysis!`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, systemMessage]);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowUpload(false);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: error instanceof APIError 
          ? `Upload failed: ${error.message}`
          : 'Upload failed. Please check your connection.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className={`h-full flex flex-col ${themeConfig.colors.background}`}>
      {/* AI Header */}
      <div className={`flex items-center justify-between p-4 border-b ${themeConfig.colors.border} ${themeConfig.colors.headerBackground} text-white`}>
        <div className="flex items-center space-x-3">
          <div className="text-2xl animate-pulse">🤖</div>
          <div>
            <h1 className="text-xl font-semibold">AI Research Assistant</h1>
            <p className="text-sm opacity-80">Powered by Advanced Intelligence</p>
          </div>
          {uploadedFiles.length > 0 && (
            <span className="text-sm bg-white/20 backdrop-blur px-3 py-1 rounded-full">
              {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''} loaded
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* AI Mode Selector */}
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value as ResearchMode)}
            className="text-sm bg-white/20 backdrop-blur border border-white/30 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            style={{ color: 'white' }}
          >
            {RESEARCH_MODES.map((mode) => (
              <option key={mode.value} value={mode.value} style={{ color: 'black' }}>
                {mode.icon} {mode.label}
              </option>
            ))}
          </select>

          {/* AI Upload */}
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="text-sm px-3 py-1 bg-white/20 backdrop-blur border border-white/30 rounded-lg hover:bg-white/30 transition-colors"
          >
            🧠 Upload
          </button>
        </div>
      </div>

      {/* Upload Panel (when toggled) */}
      {showUpload && (
        <div className={`border-b ${themeConfig.colors.border} p-4 ${themeConfig.colors.secondary}`}>
          <div className="max-w-6xl mx-auto">
            <div className={`text-sm ${themeConfig.colors.accent} mb-2 font-medium`}>🧠 Feed Knowledge to AI</div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileInputChange}
              accept={SUPPORTED_FILE_TYPES.map(type => `.${type}`).join(',')}
              className="hidden"
              disabled={isUploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full p-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-purple-400 hover:bg-white/50 transition-all duration-200 text-sm bg-white/30 backdrop-blur"
            >
              {isUploading ? (
                <div className="flex items-center justify-center space-x-2 text-blue-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>AI is analyzing your document...</span>
                </div>
              ) : (
                <div className="text-blue-800">
                  <div className="font-medium">📄 Upload Knowledge for AI Analysis</div>
                  <div className="text-xs text-blue-600 mt-1">
                    AI supports: {SUPPORTED_FILE_TYPES.slice(0, 6).join(', ').toUpperCase()} and more
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">🤖</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                How can I assist your research today?
              </h2>
              <p className="text-slate-600 mb-6">Upload documents to expand my knowledge and ask intelligent questions</p>
              
              {/* Initial Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubmit(suggestion.text)}
                    className="p-4 text-left text-sm border border-blue-200 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-purple-300 transition-all duration-200 bg-white/80 backdrop-blur"
                  >
                    <div className="font-medium text-blue-800">{suggestion.text}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.type === 'user' ? (
                    <div className="flex justify-end">
                      <div className="max-w-5xl bg-blue-600 text-white rounded-xl p-4 shadow-sm">
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                        {message.mode && (
                          <div className="text-xs text-blue-200 mt-2 opacity-75">
                            {RESEARCH_MODES.find(m => m.value === message.mode)?.label} mode
                          </div>
                        )}
                      </div>
                    </div>
                  ) : message.type === 'system' ? (
                    <div className="flex justify-center">
                      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm px-4 py-2 rounded-full border border-indigo-200 backdrop-blur">
                        🤖 {message.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <div className="max-w-5xl bg-gradient-to-br from-white to-blue-50 text-slate-800 rounded-xl p-4 shadow-sm border border-blue-200">
                        {message.thinking ? (
                          <div className="flex items-center space-x-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                            </div>
                            <span className="text-sm text-blue-600">🧠 {message.thinking}</span>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2 mb-2 text-xs text-blue-600">
                              <span className="animate-pulse">🤖</span>
                              <span>AI Assistant</span>
                            </div>
                            <FormattedText 
                              content={message.content}
                              className="max-w-none"
                            />
                            
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-gray-300">
                                <div className="text-sm font-medium text-gray-700 mb-2">
                                  Sources:
                                </div>
                                <div className="space-y-2">
                                  {message.sources.map((source, index) => (
                                    <details key={index} className="group cursor-pointer">
                                      <summary className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                        {source.title} ({(source.score * 100).toFixed(1)}% relevance)
                                      </summary>
                                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                                          <FormattedText content={source.content} />
                                        </div>
                                    </details>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Quick Follow-up Suggestions (appears after assistant response) */}
                            {messages.indexOf(message) === messages.length - 1 && 
                             !isLoading &&
                             contextualPrompts.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-gray-300">
                                <div className="text-xs text-gray-500 mb-2">Continue conversation:</div>
                                <div className="flex flex-wrap gap-2">
                                  {contextualPrompts.slice(0, 3).map((prompt, index) => (
                                    <button
                                      key={`follow-${index}`}
                                      onClick={() => handleSubmit(prompt.text)}
                                      disabled={isLoading}
                                      className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50"
                                    >
                                      {prompt.text.length > 35 ? prompt.text.substring(0, 32) + '...' : prompt.text}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions Area (appears when conversation is active) */}
      {messages.length > 0 && suggestions.length > 0 && !isLoading && (
        <div className="border-t border-indigo-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-sm text-blue-700 mb-2 font-medium">🧠 AI Suggests:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <button
                  key={`suggestion-${index}`}
                  onClick={() => handleSubmit(suggestion.text)}
                  className="text-sm px-4 py-2 bg-white/80 backdrop-blur border border-blue-200 rounded-lg hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:border-purple-300 transition-all duration-200 text-blue-800 text-left shadow-sm"
                >
                  {suggestion.text.length > 50 ? suggestion.text.substring(0, 47) + '...' : suggestion.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Input */}
      <div className="border-t border-indigo-200 bg-gradient-to-r from-white to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={uploadedFiles.length > 0 ? "Message your AI Research Assistant..." : "Upload documents to unlock AI intelligence..."}
                  disabled={isLoading}
                  rows={1}
                  className="w-full p-3 pr-12 border border-blue-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white/90 backdrop-blur shadow-sm"
                  style={{ 
                    minHeight: '50px',
                    maxHeight: '150px'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                
                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute right-3 bottom-3 p-1.5 text-blue-400 hover:text-purple-600 hover:bg-blue-100 rounded-full transition-colors disabled:opacity-50"
                  title="Upload document"
                >
                  <span className="text-lg">📎</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  accept={SUPPORTED_FILE_TYPES.map(type => `.${type}`).join(',')}
                  className="hidden"
                  disabled={isUploading}
                />
              </div>
              
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </form>
          
          {/* AI Status */}
          {isUploading && (
            <div className="mt-2 text-sm text-blue-600 text-center flex items-center justify-center space-x-2">
              <span className="animate-spin">🧠</span>
              <span>AI is analyzing your document...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}