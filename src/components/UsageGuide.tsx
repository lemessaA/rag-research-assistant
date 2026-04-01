'use client';

import { RESEARCH_MODES, SUPPORTED_FILE_TYPES } from '@/lib/constants';

export default function UsageGuide() {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        ℹ️ How to Use
      </h2>
      
      <div className="space-y-4 text-sm">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">1. Upload Documents:</h3>
          <ul className="space-y-1 text-gray-600 ml-4">
            <li>• Use the file uploader on the left</li>
            <li>• Supported: {SUPPORTED_FILE_TYPES.join(', ').toUpperCase()}</li>
            <li>• Documents are automatically processed</li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 mb-2">2. Choose Response Mode:</h3>
          <ul className="space-y-1 text-gray-600 ml-4">
            {RESEARCH_MODES.map((mode) => (
              <li key={mode.value}>
                • <strong>{mode.icon} {mode.label}:</strong> {mode.description}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 mb-2">3. Ask Questions:</h3>
          <ul className="space-y-1 text-gray-600 ml-4">
            <li>• Type your question in the chat</li>
            <li>• Click "Search" to get answers</li>
            <li>• Answers include source citations</li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 mb-2">4. View Sources:</h3>
          <ul className="space-y-1 text-gray-600 ml-4">
            <li>• Click on source titles to expand</li>
            <li>• Scores show relevance to your question</li>
            <li>• Higher scores = more relevant</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">🚀 Quick Start</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>1. TO GET magarsa rep🐍 :</p>
          <code className="block bg-blue-100 p-2 rounded text-xs font-mono mt-1">
            run ezu On CLI 🤴
          </code>
          <p>2. Upload some documents</p>
          <p>3. Start asking questions!</p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">💡 Pro Tips</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Ask specific questions for better results</li>
          <li>• Try different modes for varied perspectives</li>
          <li>• Upload related documents for comprehensive answers</li>
          <li>• Use the analytical mode for detailed breakdowns</li>
        </ul>
      </div>
    </div>
  );
}