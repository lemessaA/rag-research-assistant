'use client';

import { useState, useEffect } from 'react';
import AIChat from '@/components/AIChat';
import AIKnowledgePanel from '@/components/AIKnowledgePanel';
import AIAssistantPanel from '@/components/AIAssistantPanel';
import { UploadedFile } from '@/types';

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [aiGreeting, setAiGreeting] = useState('');

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  useEffect(() => {
    const greetings = [
      "Hello! I'm your AI research assistant. What would you like to explore today?",
      "Hi there! I'm here to help you discover insights from your documents. How can I assist?",
      "Welcome! I'm your intelligent research companion. Upload a document or ask me anything!",
      "Greetings! Ready to unlock knowledge together? Let's dive into your research!"
    ];
    setAiGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* AI Greeting Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <div className="text-2xl animate-bounce">🤖</div>
            <div className="flex-1">
              <p className="text-lg font-medium">{aiGreeting}</p>
              <p className="text-sm text-blue-100">
                Powered by advanced AI • Real-time research • Intelligent insights
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* AI Knowledge Panel */}
          <div className="lg:col-span-3">
            <AIKnowledgePanel 
              uploadedFiles={uploadedFiles}
              onFileUploaded={handleFileUploaded}
            />
          </div>

          {/* Main AI Chat Interface */}
          <div className="lg:col-span-6">
            <AIChat uploadedFiles={uploadedFiles} />
          </div>

          {/* AI Assistant Panel */}
          <div className="lg:col-span-3">
            <AIAssistantPanel 
              isConnected={isConnected}
              onConnectionChange={setIsConnected}
              uploadedFiles={uploadedFiles}
            />
          </div>
        </div>
      </div>
    </div>
  );
}