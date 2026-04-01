'use client';

import { useState } from 'react';
import AIChat from '@/components/AIChat';
import AIKnowledgePanel from '@/components/AIKnowledgePanel';
import { UploadedFile } from '@/types';

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <AIKnowledgePanel 
                uploadedFiles={uploadedFiles}
                onFileUploaded={handleFileUploaded}
              />
            </div>
          </div>

          {/* Main Chat Interface */}
          <div className="lg:col-span-3">
            <AIChat uploadedFiles={uploadedFiles} />
          </div>
        </div>
      </div>
    </div>
  );
}