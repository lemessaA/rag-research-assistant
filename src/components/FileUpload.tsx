'use client';

import { useState, useRef } from 'react';
import { api, APIError } from '@/lib/api';
import { UploadedFile } from '@/types';
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';

interface FileUploadProps {
  onFileUploaded: (file: UploadedFile) => void;
}

export default function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension || !SUPPORTED_FILE_TYPES.includes(extension)) {
      return `Unsupported file type. Supported types: ${SUPPORTED_FILE_TYPES.join(', ')}`;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }
    
    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadStatus({ type: 'error', message: validationError });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

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
      setUploadStatus({ 
        type: 'success', 
        message: `✅ ${result.message} (${result.chunks_created} chunks created)` 
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      if (error instanceof APIError) {
        setUploadStatus({ 
          type: 'error', 
          message: `❌ Upload failed: ${error.message}` 
        });
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: '❌ Network error. Check if the backend is running.' 
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        📁 Upload Documents
      </h2>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleInputChange}
          accept={SUPPORTED_FILE_TYPES.map(type => `.${type}`).join(',')}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📄</div>
          <div className="text-sm text-gray-600">
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <>
                <p className="font-medium">Drop files here or click to browse</p>
                <p className="text-xs">
                  Supported: {SUPPORTED_FILE_TYPES.join(', ').toUpperCase()}
                </p>
                <p className="text-xs">Max size: {MAX_FILE_SIZE / 1024 / 1024}MB</p>
              </>
            )}
          </div>
        </div>
      </div>
      
      {uploadStatus.type && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {uploadStatus.message}
        </div>
      )}
    </div>
  );
}