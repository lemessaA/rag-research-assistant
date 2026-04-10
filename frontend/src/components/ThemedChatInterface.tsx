'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { api, APIError } from '@/lib/api';
import { ResearchMode, ResearchResponse, UploadedFile } from '@/types';
import { RESEARCH_MODES, SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';
import { useSmartSuggestions, SuggestionContext } from '@/lib/smartSuggestions';
import FormattedText from './FormattedText';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  mode?: ResearchMode;
  sources?: ResearchResponse['sources'];
  thinking?: string;
}

interface ThemedChatInterfaceProps {
  uploadedFiles: UploadedFile[];
  onFileUploaded: (file: UploadedFile) => void;
}

type Theme = 'light' | 'dark' | 'ocean' | 'warm' | 'forest';

const themes = {
  light: {
    name: 'Light',
    icon: '☀️',
    background: 'from-gray-50 to-blue-50',
    header: 'from-blue-600 to-purple-600',
    card: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    accent: 'text-blue-600',
    border: 'border-gray-200'
  },
  dark: {
    name: 'Dark',
    icon: '🌙',
    background: 'from-slate-900 to-slate-800',
    header: 'from-slate-800 to-slate-700',
    card: 'bg-slate-800',
    text: 'text-slate-100',
    textSecondary: 'text-slate-300',
    accent: 'text-blue-400',
    border: 'border-slate-600'
  },
  ocean: {
    name: 'Ocean',
    icon: '🌊',
    background: 'from-sky-50 to-cyan-100',
    header: 'from-cyan-600 to-blue-600',
    card: 'bg-white/90',
    text: 'text-slate-800',
    textSecondary: 'text-slate-600',
    accent: 'text-cyan-600',
    border: 'border-cyan-200'
  },
  warm: {
    name: 'Warm',
    icon: '🔥',
    background: 'from-orange-50 to-amber-100',
    header: 'from-orange-600 to-red-600',
    card: 'bg-white/90',
    text: 'text-slate-800',
    textSecondary: 'text-slate-600',
    accent: 'text-orange-600',
    border: 'border-orange-200'
  },
  forest: {
    name: 'Forest',
    icon: '🌲',
    background: 'from-green-50 to-emerald-100',
    header: 'from-green-600 to-emerald-600',
    card: 'bg-white/85',
    text: 'text-slate-800',
    textSecondary: 'text-slate-600',
    accent: 'text-green-600',
    border: 'border-green-200'
  }
};

export default function ThemedChatInterface({ uploadedFiles, onFileUploaded }: ThemedChatInterfaceProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<ResearchMode>('research');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = themes[currentTheme];

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('ai-chat-theme') as Theme;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('ai-chat-theme', currentTheme);
  }, [currentTheme]);

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

    const thinkingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      thinking: 'AI is thinking...',
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const result = await api.research({ question, mode: selectedMode });

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
    <div className={`h-full flex flex-col bg-gradient-to-br ${theme.background}`}>
      {/* AI Header with Theme Toggle */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.border} bg-gradient-to-r ${theme.header} text-white`}>
        <div className="flex items-center space-x-3">
          <div className="text-2xl animate-pulse">🤖</div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold leading-tight">AI Research Assistant</h1>
            <p className="text-xs sm:text-sm opacity-80 hidden xs:block">Powered by Advanced Intelligence</p>
          </div>
          {uploadedFiles.length > 0 && (
            <span className="text-[10px] sm:text-sm bg-white/20 backdrop-blur px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
              {uploadedFiles.length} <span className="hidden xs:inline">doc{uploadedFiles.length !== 1 ? 's' : ''}</span>
            </span>
          )}
        </div>


        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur border border-white/30 rounded-lg hover:bg-white/30 transition-colors text-sm"
            >
              <span>{theme.icon}</span>
              <span className="hidden sm:inline">{theme.name}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showThemeMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowThemeMenu(false)} />
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-20 min-w-48">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 px-3 py-2">Comfortable Themes</div>
                    <div className="space-y-1">
                      {(Object.keys(themes) as Theme[]).map((themeName) => {
                        const themeOption = themes[themeName];
                        const isActive = currentTheme === themeName;

                        return (
                          <button
                            key={themeName}
                            onClick={() => {
                              setCurrentTheme(themeName);
                              setShowThemeMenu(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors text-sm ${isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            <span className="text-lg">{themeOption.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium">{themeOption.name}</div>
                            </div>
                            {isActive && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

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
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">🤖</div>
              <h2 className={`text-3xl font-bold mb-2 ${theme.text}`}>
                How can I assist your research today?
              </h2>
              <p className={`${theme.textSecondary} mb-6`}>Upload documents to expand my knowledge and ask intelligent questions</p>

              {/* Initial Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubmit(suggestion.text)}
                    className={`p-4 text-left text-sm ${theme.border} rounded-xl hover:opacity-80 transition-all duration-200 ${theme.card} backdrop-blur shadow-sm`}
                  >
                    <div className={`font-medium ${theme.text}`}>{suggestion.text}</div>
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
                      <div className="max-w-[85%] sm:max-w-5xl bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-3 sm:p-4 shadow-sm">
                        <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{message.content}</div>
                        {message.mode && (
                          <div className="text-[10px] opacity-75 mt-2">
                            {RESEARCH_MODES.find(m => m.value === message.mode)?.label} mode
                          </div>
                        )}
                      </div>

                    </div>
                  ) : message.type === 'system' ? (
                    <div className="flex justify-center">
                      <div className={`${theme.accent} text-sm px-4 py-2 rounded-full ${theme.card} border ${theme.border} backdrop-blur shadow-sm`}>
                        🤖 {message.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <div className={`max-w-[90%] sm:max-w-5xl ${theme.card} ${theme.text} rounded-xl p-3 sm:p-4 shadow-sm border ${theme.border} backdrop-blur`}>

                        {message.thinking ? (
                          <div className="flex items-center space-x-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                            </div>
                            <span className={`text-sm ${theme.accent}`}>🧠 {message.thinking}</span>
                          </div>
                        ) : (
                          <>
                            <div className={`flex items-center space-x-2 mb-2 text-xs ${theme.accent}`}>
                              <span className="animate-pulse">🤖</span>
                              <span>AI Assistant</span>
                            </div>
                            <FormattedText
                              content={message.content}
                              className="max-w-none"
                            />

                            {message.sources && message.sources.length > 0 && (
                              <div className={`mt-4 pt-3 border-t ${theme.border}`}>
                                <div className={`text-sm font-medium ${theme.text} mb-2`}>
                                  Sources:
                                </div>
                                <div className="space-y-2">
                                  {message.sources.map((source, index) => (
                                    <details key={index} className="group cursor-pointer">
                                      <summary className={`text-sm font-medium ${theme.accent} hover:opacity-80`}>
                                        {source.title} ({(source.score * 100).toFixed(1)}% relevance)
                                      </summary>
                                      <div className={`mt-2 text-sm ${theme.textSecondary} ${theme.card} p-3 rounded border ${theme.border}`}>
                                        <FormattedText content={source.content} />
                                      </div>
                                    </details>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Quick Follow-up Suggestions */}
                            {messages.indexOf(message) === messages.length - 1 &&
                              !isLoading &&
                              contextualPrompts.length > 0 && (
                                <div className={`mt-4 pt-3 border-t ${theme.border}`}>
                                  <div className={`text-xs ${theme.textSecondary} mb-2`}>Continue conversation:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {contextualPrompts.slice(0, 3).map((prompt, index) => (
                                      <button
                                        key={`follow-${index}`}
                                        onClick={() => handleSubmit(prompt.text)}
                                        disabled={isLoading}
                                        className={`text-xs px-3 py-1 ${theme.card} ${theme.accent} rounded-full hover:opacity-80 transition-colors disabled:opacity-50 border ${theme.border}`}
                                      >
                                        {prompt.text.length > 35 ? prompt.text.substring(0, 32) + '...' : prompt.text}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </>
                        )}

                        <div className={`text-xs opacity-50 mt-2 ${theme.textSecondary}`}>
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

      {/* Suggestions Area */}
      {messages.length > 0 && suggestions.length > 0 && !isLoading && (
        <div className={`border-t ${theme.border} ${theme.card} p-4 backdrop-blur`}>
          <div className="max-w-6xl mx-auto">
            <div className={`text-sm ${theme.accent} mb-2 font-medium`}>🧠 AI Suggests:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <button
                  key={`suggestion-${index}`}
                  onClick={() => handleSubmit(suggestion.text)}
                  className={`text-sm px-4 py-2 ${theme.card} backdrop-blur border ${theme.border} rounded-lg hover:opacity-80 transition-all duration-200 ${theme.text} text-left shadow-sm`}
                >
                  {suggestion.text.length > 50 ? suggestion.text.substring(0, 47) + '...' : suggestion.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Input */}
      <div className={`border-t ${theme.border} ${theme.card} p-4 backdrop-blur`}>
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
                  className={`w-full p-3 pr-10 sm:pr-12 border ${theme.border} rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${theme.card} backdrop-blur shadow-sm ${theme.text} text-sm sm:text-base`}
                  style={{ 
                    minHeight: '44px',
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
                  className={`absolute right-2 sm:right-3 bottom-2 sm:bottom-3 p-1.5 ${theme.accent} hover:bg-blue-100 rounded-full transition-colors disabled:opacity-50`}
                  title="Upload document"
                >
                  <span className="text-base sm:text-lg">📎</span>
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
            <div className={`mt-2 text-sm ${theme.accent} text-center flex items-center justify-center space-x-2`}>
              <span className="animate-spin">🧠</span>
              <span>AI is analyzing your document...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}