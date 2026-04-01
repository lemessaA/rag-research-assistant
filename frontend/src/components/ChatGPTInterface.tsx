'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { api, APIError } from '@/lib/api';
import { ResearchMode, ResearchResponse, UploadedFile } from '@/types';
import { RESEARCH_MODES, SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
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

interface ChatGPTInterfaceProps {
  uploadedFiles: UploadedFile[];
  onFileUploaded: (file: UploadedFile) => void;
}

export default function ChatGPTInterface({ uploadedFiles, onFileUploaded }: ChatGPTInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<ResearchMode>('research');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
      fileTypes: [...new Set(fileTypes)],
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
      
      // Add system message about upload
      const systemMessage: ChatMessage = {
        id: `upload-${Date.now()}`,
        type: 'system',
        content: `📄 Uploaded "${file.name}" (${result.chunks_created} chunks). You can now ask questions about this document.`,
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
    <div className="h-full flex flex-col bg-white">
      {/* ChatGPT-style Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-gray-800">Research Assistant</h1>
          {uploadedFiles.length > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Mode Selector */}
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value as ResearchMode)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {RESEARCH_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>

          {/* Upload Toggle */}
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            📎
          </button>
        </div>
      </div>

      {/* Upload Panel (when toggled) */}
      {showUpload && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="max-w-3xl mx-auto">
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
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm text-gray-600"
            >
              {isUploading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Processing document...</span>
                </div>
              ) : (
                <div>
                  <span className="font-medium">Choose a file to upload</span>
                  <div className="text-xs text-gray-500 mt-1">
                    Supports: {SUPPORTED_FILE_TYPES.join(', ').toUpperCase()}
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
            <div className="text-center text-gray-500 py-12">
              <div className="text-5xl mb-4">💬</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">How can I help you today?</h2>
              <p className="text-gray-600 mb-6">Upload documents and ask questions to get started</p>
              
              {/* Initial Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubmit(suggestion.text)}
                    className="p-4 text-left text-sm border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <div className="font-medium text-gray-800">{suggestion.text}</div>
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
                      <div className="max-w-5xl bg-blue-600 text-white rounded-lg p-4">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.mode && (
                          <div className="text-xs text-blue-200 mt-2">
                            {RESEARCH_MODES.find(m => m.value === message.mode)?.label} mode
                          </div>
                        )}
                      </div>
                    </div>
                  ) : message.type === 'system' ? (
                    <div className="flex justify-center">
                      <div className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-full">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <div className="max-w-5xl bg-gray-100 text-gray-900 rounded-lg p-4">
                        {message.thinking ? (
                          <div className="flex items-center space-x-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                            <span className="text-sm text-gray-600">{message.thinking}</span>
                          </div>
                        ) : (
                          <>
                            <div className="prose prose-sm max-w-none text-gray-900">
                              {message.content}
                            </div>
                            
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
                                        {source.content}
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
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <button
                  key={`suggestion-${index}`}
                  onClick={() => handleSubmit(suggestion.text)}
                  className="text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-gray-700 text-left"
                >
                  {suggestion.text.length > 50 ? suggestion.text.substring(0, 47) + '...' : suggestion.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ChatGPT-style Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={uploadedFiles.length > 0 ? "Message Research Assistant" : "Upload documents first, then ask questions..."}
                  disabled={isLoading}
                  rows={1}
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="absolute right-3 bottom-3 p-1.5 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
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
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
          
          {/* Upload Status */}
          {isUploading && (
            <div className="mt-2 text-sm text-blue-600 text-center">
              Processing document...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}