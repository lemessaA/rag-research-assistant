'use client';

import { useState } from 'react';
import AIChat from '@/components/AIChat';
import { UploadedFile } from '@/types';

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Full Page Chat Interface */}
        <AIChat 
          uploadedFiles={uploadedFiles} 
          onFileUploaded={handleFileUploaded}
        />
      </div>
    </div>
  );
}