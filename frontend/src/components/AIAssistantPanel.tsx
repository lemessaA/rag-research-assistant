'use client';

import { useEffect, useState } from 'react';
import { api, APIError } from '@/lib/api';
import { UploadedFile } from '@/types';
import { RESEARCH_MODES } from '@/lib/constants';

interface AIAssistantPanelProps {
  isConnected: boolean | null;
  onConnectionChange: (connected: boolean) => void;
  uploadedFiles: UploadedFile[];
}

export default function AIAssistantPanel({ 
  isConnected, 
  onConnectionChange, 
  uploadedFiles 
}: AIAssistantPanelProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [currentTip, setCurrentTip] = useState(0);

  const checkConnection = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      await api.health();
      onConnectionChange(true);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (error) {
      onConnectionChange(false);
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Dynamic AI tips based on context
    const baseTips = [
      "💡 Try asking specific questions about data, statistics, or key findings",
      "🔍 Use analytical mode for detailed breakdowns and insights",
      "🎨 Switch to creative mode for engaging explanations and storytelling",
      "📊 Ask me to compare information across multiple documents",
      "🎯 I can help identify patterns and trends in your data"
    ];

    const contextTips = [];
    if (uploadedFiles.length === 0) {
      contextTips.push("📄 Upload documents to unlock my full AI capabilities!");
    } else if (uploadedFiles.length === 1) {
      contextTips.push("📚 Upload more documents for cross-document analysis!");
    } else {
      contextTips.push("🔗 I can now analyze connections across your documents!");
    }

    setAiTips([...contextTips, ...baseTips]);
  }, [uploadedFiles]);

  useEffect(() => {
    if (aiTips.length > 0) {
      const tipInterval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % aiTips.length);
      }, 4000);
      return () => clearInterval(tipInterval);
    }
  }, [aiTips]);

  const getStatusColor = () => {
    if (isConnected === null) return 'gray';
    return isConnected ? 'green' : 'red';
  };

  const getStatusText = () => {
    if (isConnected === null) return 'Initializing AI...';
    return isConnected ? 'AI Online' : 'AI Offline';
  };

  const getStatusIcon = () => {
    if (isConnected === null) return '🔄';
    return isConnected ? '🤖' : '🔌';
  };

  return (
    <div className="space-y-6">
      {/* AI Status */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xl">🔗</span>
            <h3 className="text-lg font-semibold text-gray-900">AI Connection</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  getStatusColor() === 'green' ? 'bg-green-500 animate-pulse' :
                  getStatusColor() === 'red' ? 'bg-red-500' : 'bg-gray-400 animate-spin'
                }`}></div>
                <span className="text-sm font-medium">AI Backend</span>
              </div>
              <span className="text-lg">{getStatusIcon()}</span>
            </div>
            
            <div className="text-sm">
              <div className={`font-medium ${
                getStatusColor() === 'green' ? 'text-green-600' :
                getStatusColor() === 'red' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {getStatusText()}
              </div>
              {lastChecked && (
                <div className="text-xs text-gray-500 mt-1">
                  Last check: {lastChecked}
                </div>
              )}
            </div>
            
            <button
              onClick={checkConnection}
              disabled={isChecking}
              className="w-full btn-secondary text-sm disabled:opacity-50"
            >
              {isChecking ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                  <span>Testing AI...</span>
                </div>
              ) : (
                '🔄 Test AI Connection'
              )}
            </button>
            
            {isConnected === false && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-800">
                  <div className="font-medium mb-1">AI Offline</div>
                  <div className="text-xs">
                    Make sure the AI backend is running on port 8000.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Intelligence Modes */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xl">🧠</span>
          <h3 className="text-lg font-semibold text-gray-900">AI Intelligence Modes</h3>
        </div>
        
        <div className="space-y-3">
          {RESEARCH_MODES.map((mode) => (
            <div key={mode.value} className="bg-white rounded-lg p-3 border border-purple-100">
              <div className="flex items-start space-x-3">
                <span className="text-lg">{mode.icon}</span>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{mode.label}</div>
                  <div className="text-xs text-gray-600">{mode.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Smart Tips */}
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xl">💡</span>
          <h3 className="text-lg font-semibold text-gray-900">AI Smart Tips</h3>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-blue-200 min-h-[80px] flex items-center">
          {aiTips.length > 0 && (
            <div className="w-full">
              <div className="text-sm text-gray-700 animate-fade-in">
                {aiTips[currentTip]}
              </div>
              <div className="flex justify-center mt-3 space-x-1">
                {aiTips.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentTip ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Performance Stats */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">📊</span>
              <h3 className="text-lg font-semibold text-gray-900">AI Performance</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Knowledge Processing</span>
                <span className="text-sm font-medium text-green-600">Optimal</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-[85%]"></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Quality</span>
                <span className="text-sm font-medium text-blue-600">High</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full w-[92%]"></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Context Understanding</span>
                <span className="text-sm font-medium text-purple-600">Excellent</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full w-[96%]"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xl">⚡</span>
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => window.open('http://localhost:8000/docs', '_blank')}
              className="w-full text-left p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-colors text-sm"
            >
              <div className="font-medium text-gray-900">🔧 AI API Documentation</div>
              <div className="text-xs text-gray-600">Explore AI capabilities</div>
            </button>
            
            <button 
              className="w-full text-left p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:from-green-100 hover:to-blue-100 transition-colors text-sm"
            >
              <div className="font-medium text-gray-900">📈 View AI Analytics</div>
              <div className="text-xs text-gray-600">Coming soon</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}