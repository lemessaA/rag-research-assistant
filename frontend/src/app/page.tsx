'use client';

import { useState } from 'react';
import ChatGPTInterface from '@/components/ChatGPTInterface';
import { UploadedFile } from '@/types';

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <ChatGPTInterface 
        uploadedFiles={uploadedFiles} 
        onFileUploaded={handleFileUploaded}
      />
    </div>
  );
}