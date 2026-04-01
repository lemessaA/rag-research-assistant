import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Research Assistant',
  description: 'ChatGPT-style research assistant. Upload documents and ask questions through an intuitive chat interface.',
  keywords: 'research assistant, document analysis, chat interface, AI, questions, answers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen bg-gray-50 overflow-hidden">
        {children}
      </body>
    </html>
  );
}