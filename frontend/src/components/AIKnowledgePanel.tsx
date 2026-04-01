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
      {/* AI Knowledge Status */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-2xl">🧠</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Knowledge Base</h3>
            <p className="text-sm text-gray-600">Feed me documents to expand my knowledge</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{uploadedFiles.length}</div>
            <div className="text-xs text-gray-600">Documents</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{getTotalKnowledgeChunks()}</div>
            <div className="text-xs text-gray-600">Knowledge Chunks</div>
          </div>
        </div>
      </div>

      {/* AI Document Upload */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xl">📄</span>
            <h3 className="text-lg font-semibold text-gray-900">Feed AI New Knowledge</h3>
          </div>
          
          <div
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
              dragActive
                ? 'border-blue-400 bg-blue-50 scale-105'
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
            
            <div className="space-y-3">
              {isUploading ? (
                <>
                  <div className="text-4xl animate-spin">🧠</div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">AI is processing...</p>
                    <p className="text-xs">Analyzing and chunking your document</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl">{dragActive ? '🎯' : '📁'}</div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Drop files here or click to browse</p>
                    <p className="text-xs mt-1">
                      AI supports: {SUPPORTED_FILE_TYPES.slice(0, 5).join(', ').toUpperCase()}
                    </p>
                    <p className="text-xs">Max size: {MAX_FILE_SIZE / 1024 / 1024}MB</p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {uploadStatus.type && (
            <div className={`mt-4 p-3 rounded-lg text-sm border ${
              uploadStatus.type === 'success' 
                ? 'bg-green-50 text-green-800 border-green-200'
                : uploadStatus.type === 'processing'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              {uploadStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* AI Knowledge Library */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl">🗃️</span>
              <h3 className="text-lg font-semibold text-gray-900">AI Knowledge Library</h3>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">📄</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate text-sm">
                        {file.name}
                      </div>
                      <div className="text-gray-500 text-xs mt-1 flex items-center space-x-2">
                        <span>🧩 {file.chunksCreated} chunks</span>
                        <span>•</span>
                        <span>📅 {new Date(file.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        💾 {(file.size / 1024).toFixed(1)}KB
                      </div>
                    </div>
                    <div className="text-green-500 text-sm">
                      ✅
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Capabilities */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-xl">⚡</span>
          <h3 className="text-lg font-semibold text-gray-900">AI Capabilities</h3>
        </div>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Document analysis & summarization</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Intelligent question answering</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Cross-document insights</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-500">✓</span>
            <span>Multiple reasoning modes</span>
          </div>
        </div>
      </div>
    </div>
  );
}