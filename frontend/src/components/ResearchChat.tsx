'use client';

import { useState } from 'react';
import { api, APIError } from '@/lib/api';
import { ResearchMode, ResearchResponse } from '@/types';
import { RESEARCH_MODES } from '@/lib/constants';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: ResearchMode;
  sources?: ResearchResponse['sources'];
}

export default function ResearchChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [selectedMode, setSelectedMode] = useState<ResearchMode>('research');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date().toISOString(),
      mode: selectedMode,
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const result = await api.research({ question, mode: selectedMode });
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.answer,
        timestamp: new Date().toISOString(),
        sources: result.sources,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: error instanceof APIError 
          ? `Error: ${error.message}`
          : 'Network error. Please check if the backend is running.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedModeInfo = RESEARCH_MODES.find(mode => mode.value === selectedMode);

  return (
    <div className="card h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        💬 Ask Questions
      </h2>
      
      {/* Mode Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Response Mode:
        </label>
        <select
          value={selectedMode}
          onChange={(e) => setSelectedMode(e.target.value as ResearchMode)}
          className="input w-full"
        >
          {RESEARCH_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.icon} {mode.label} - {mode.description}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 max-h-96 overflow-y-auto mb-6 space-y-4 border rounded-lg p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">🤖</div>
            <p>Start by asking a question about your uploaded documents!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 shadow-sm border'
              }`}>
                {message.type === 'user' && message.mode && (
                  <div className="text-xs opacity-75 mb-1">
                    {selectedModeInfo?.icon} {selectedModeInfo?.label} mode
                  </div>
                )}
                
                <div className="prose prose-sm max-w-none">
                  {message.content}
                </div>
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      📚 Sources:
                    </div>
                    <div className="space-y-2">
                      {message.sources.map((source, index) => (
                        <details key={index} className="group">
                          <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                            {source.title} (Score: {source.score.toFixed(2)})
                          </summary>
                          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border">
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
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 shadow-sm border rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Searching knowledge base...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Question Input */}
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What would you like to know about your documents?"
          className="input flex-1"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>🔍</span>
            </div>
          ) : (
            '🔍 Search'
          )}
        </button>
      </form>
    </div>
  );
}