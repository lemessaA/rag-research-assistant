'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ResearchChat from '@/components/ResearchChat';
import UsageGuide from '@/components/UsageGuide';
import ConnectionStatus from '@/components/ConnectionStatus';
import { UploadedFile } from '@/types';

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - File Upload */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <FileUpload onFileUploaded={handleFileUploaded} />
            
            {uploadedFiles.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📚 Uploaded Documents
                </h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border text-sm"
                    >
                      <div className="font-medium text-gray-900 truncate">
                        {file.name}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {file.chunksCreated} chunks • {new Date(file.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Chat Interface */}
        <div className="lg:col-span-2">
          <ResearchChat />
        </div>

        {/* Right Sidebar - Usage Guide */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <ConnectionStatus 
              isConnected={isConnected} 
              onConnectionChange={setIsConnected} 
            />
            <UsageGuide />
          </div>
        </div>
      </div>
    </div>
  );
}