'use client';

import { useState, useRef } from 'react';
import { api, APIError } from '@/lib/api';
import { UploadedFile } from '@/types';
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants';

interface AIKnowledgePanelProps {
  uploadedFiles: UploadedFile[];
  onFileUploaded: (file: UploadedFile) => void;
}

export default function AIKnowledgePanel({ uploadedFiles, onFileUploaded }: AIKnowledgePanelProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | 'processing' | null;
    message: string;
  }>({ type: null, message: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension || !SUPPORTED_FILE_TYPES.includes(extension)) {
      return `Unsupported file type. My AI can process: ${SUPPORTED_FILE_TYPES.join(', ').toUpperCase()}`;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. My processing limit is ${MAX_FILE_SIZE / 1024 / 1024}MB`;
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
    setUploadStatus({ type: 'processing', message: `🧠 AI is analyzing "${file.name}"...` });

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
        message: `✅ AI successfully processed "${file.name}" into ${result.chunks_created} knowledge chunks!` 
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setUploadStatus({ type: null, message: '' });
      }, 3000);
    } catch (error) {
      if (error instanceof APIError) {
        setUploadStatus({ 
          type: 'error', 
          message: `❌ AI processing failed: ${error.message}` 
        });
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: '❌ Cannot connect to AI backend. Please check the connection.' 
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

  const getTotalKnowledgeChunks = () => {
    return uploadedFiles.reduce((total, file) => total + (file.chunksCreated || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Knowledge Status */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Base</h3>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xl font-bold text-gray-900">{uploadedFiles.length}</div>
            <div className="text-xs text-gray-600">Documents</div>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-xl font-bold text-gray-900">{getTotalKnowledgeChunks()}</div>
            <div className="text-xs text-gray-600">Chunks</div>
          </div>
        </div>
      </div>

      {/* Document Upload */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
          
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-gray-50'}`}
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
            
            {isUploading ? (
              <div className="space-y-2">
                <div className="text-3xl">📄</div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Processing...</p>
                  <p className="text-xs">Analyzing document</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-3xl">📄</div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Drop files here or click to browse</p>
                  <p className="text-xs mt-1">
                    Supported: {SUPPORTED_FILE_TYPES.slice(0, 5).join(', ').toUpperCase()}
                  </p>
                  <p className="text-xs">Max size: {MAX_FILE_SIZE / 1024 / 1024}MB</p>
                </div>
              </div>
            )}
          </div>
          
          {uploadStatus.type && (
            <div className={`mt-4 p-3 rounded text-sm ${
              uploadStatus.type === 'success' 
                ? 'bg-green-50 text-green-800'
                : uploadStatus.type === 'processing'
                ? 'bg-blue-50 text-blue-800'
                : 'bg-red-50 text-red-800'
            }`}>
              {uploadStatus.message.replace(/[🧠✅❌]/g, '').trim()}
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate text-sm">
                        {file.name}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {file.chunksCreated} chunks • {(file.size / 1024).toFixed(1)}KB
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-green-600 text-sm ml-2">
                      ✓
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}