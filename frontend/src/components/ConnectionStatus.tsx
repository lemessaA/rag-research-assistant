'use client';

import { useEffect, useState } from 'react';
import { api, APIError } from '@/lib/api';

interface ConnectionStatusProps {
  isConnected: boolean | null;
  onConnectionChange: (connected: boolean) => void;
}

export default function ConnectionStatus({ isConnected, onConnectionChange }: ConnectionStatusProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkConnection = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      await api.health();
      onConnectionChange(true);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (error) {
      onConnectionChange(false);
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isConnected === null) return 'gray';
    return isConnected ? 'green' : 'red';
  };

  const getStatusText = () => {
    if (isConnected === null) return 'Checking...';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  const getStatusIcon = () => {
    if (isConnected === null) return '⏳';
    return isConnected ? '✅' : '❌';
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        🔗 Connection Status
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              getStatusColor() === 'green' ? 'bg-green-500' :
              getStatusColor() === 'red' ? 'bg-red-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm font-medium">Backend API</span>
          </div>
          <span className="text-xs text-gray-500">{getStatusIcon()}</span>
        </div>
        
        <div className="text-sm">
          <div className={`font-medium ${
            getStatusColor() === 'green' ? 'text-green-600' :
            getStatusColor() === 'red' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {getStatusText()}
          </div>
          {lastChecked && (
            <div className="text-xs text-gray-500 mt-1">
              Last checked: {lastChecked}
            </div>
          )}
        </div>
        
        <button
          onClick={checkConnection}
          disabled={isChecking}
          className="btn-secondary text-xs w-full disabled:opacity-50"
        >
          {isChecking ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
              <span>Checking...</span>
            </div>
          ) : (
            '🔄 Check Connection'
          )}
        </button>
        
        {isConnected === false && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-800">
              <div className="font-medium mb-1">Backend not responding</div>
              <div className="text-xs">
                Make sure the FastAPI server is running on the configured port.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}