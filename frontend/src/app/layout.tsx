import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'AI Research Assistant',
  description: 'Intelligent AI research companion. Upload documents and discover insights through advanced AI conversation.',
  keywords: 'AI, artificial intelligence, research assistant, document analysis, intelligent chat, AI companion, smart research',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}