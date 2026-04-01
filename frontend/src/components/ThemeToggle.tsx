'use client';

import { useState } from 'react';
import { useTheme, themes, ThemeType } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme, themeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur border border-white/30 rounded-lg hover:bg-white/30 transition-colors text-white text-sm"
        title="Change theme"
      >
        <span>{themeConfig.icon}</span>
        <span className="hidden sm:inline">{themeConfig.name}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Overlay to close menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Theme menu */}
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-20 min-w-48">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
                Choose Theme
              </div>
              
              <div className="space-y-1 mt-2">
                {(Object.keys(themes) as ThemeType[]).map((themeName) => {
                  const themeOption = themes[themeName];
                  const isActive = theme === themeName;
                  
                  return (
                    <button
                      key={themeName}
                      onClick={() => {
                        setTheme(themeName);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors text-sm ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{themeOption.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{themeOption.name}</div>
                        <div className="text-xs text-gray-500">{themeOption.description}</div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="border-t border-gray-100 mt-2 pt-2">
                <div className="text-xs text-gray-500 px-3 py-1">
                  Theme saves automatically
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}