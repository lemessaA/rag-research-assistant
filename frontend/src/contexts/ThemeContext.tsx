'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeType = 'light' | 'dark' | 'ocean' | 'warm' | 'forest';

export interface ThemeConfig {
  name: string;
  colors: {
    background: string;
    cardBackground: string;
    headerBackground: string;
    inputBackground: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    secondary: string;
    accent: string;
  };
  icon: string;
  description: string;
}

export const themes: Record<ThemeType, ThemeConfig> = {
  light: {
    name: 'Light',
    icon: '☀️',
    description: 'Clean and bright',
    colors: {
      background: 'bg-gray-50',
      cardBackground: 'bg-white',
      headerBackground: 'bg-gradient-to-r from-blue-600 to-purple-600',
      inputBackground: 'bg-white/90',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      primary: 'bg-gradient-to-r from-blue-600 to-purple-600',
      secondary: 'bg-gray-100',
      accent: 'text-blue-600'
    }
  },
  dark: {
    name: 'Dark',
    icon: '🌙',
    description: 'Easy on the eyes',
    colors: {
      background: 'bg-slate-900',
      cardBackground: 'bg-slate-800',
      headerBackground: 'bg-gradient-to-r from-slate-800 to-slate-700',
      inputBackground: 'bg-slate-700/90',
      text: 'text-slate-100',
      textSecondary: 'text-slate-300',
      border: 'border-slate-600',
      primary: 'bg-gradient-to-r from-blue-500 to-purple-500',
      secondary: 'bg-slate-700',
      accent: 'text-blue-400'
    }
  },
  ocean: {
    name: 'Ocean',
    icon: '🌊',
    description: 'Calming blue vibes',
    colors: {
      background: 'bg-gradient-to-br from-sky-50 to-cyan-100',
      cardBackground: 'bg-white/80',
      headerBackground: 'bg-gradient-to-r from-cyan-600 to-blue-600',
      inputBackground: 'bg-white/90',
      text: 'text-slate-800',
      textSecondary: 'text-slate-600',
      border: 'border-cyan-200',
      primary: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      secondary: 'bg-cyan-100',
      accent: 'text-cyan-600'
    }
  },
  warm: {
    name: 'Warm',
    icon: '🔥',
    description: 'Cozy and inviting',
    colors: {
      background: 'bg-gradient-to-br from-orange-50 to-amber-100',
      cardBackground: 'bg-white/90',
      headerBackground: 'bg-gradient-to-r from-orange-600 to-red-600',
      inputBackground: 'bg-white/90',
      text: 'text-slate-800',
      textSecondary: 'text-slate-600',
      border: 'border-orange-200',
      primary: 'bg-gradient-to-r from-orange-500 to-red-500',
      secondary: 'bg-orange-100',
      accent: 'text-orange-600'
    }
  },
  forest: {
    name: 'Forest',
    icon: '🌲',
    description: 'Natural and relaxing',
    colors: {
      background: 'bg-gradient-to-br from-green-50 to-emerald-100',
      cardBackground: 'bg-white/85',
      headerBackground: 'bg-gradient-to-r from-green-600 to-emerald-600',
      inputBackground: 'bg-white/90',
      text: 'text-slate-800',
      textSecondary: 'text-slate-600',
      border: 'border-green-200',
      primary: 'bg-gradient-to-r from-green-500 to-emerald-500',
      secondary: 'bg-green-100',
      accent: 'text-green-600'
    }
  }
};

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('research-assistant-theme') as ThemeType;
    if (savedTheme && themes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('research-assistant-theme', theme);
  }, [theme]);

  const themeConfig = themes[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}