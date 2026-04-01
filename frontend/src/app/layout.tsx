import type { Metadata } from 'next';
import './globals.css';

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
      <body className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        {children}
      </body>
    </html>
  );
}