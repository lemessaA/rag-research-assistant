'use client';

import { useState } from 'react';
import ThemedChatInterface from '@/components/ThemedChatInterface';
import { UploadedFile } from '@/types';

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  return (
    <div className="h-screen">
      <ThemedChatInterface 
        uploadedFiles={uploadedFiles} 
        onFileUploaded={handleFileUploaded}
      />
    </div>
  );
}