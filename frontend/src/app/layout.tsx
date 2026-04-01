import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'magarsa AI Research Assistant',
  description: 'Your intelligent research companion powered by advanced AI. Upload documents and unlock knowledge through conversational AI.',
  keywords: 'AI, research assistant, document analysis, intelligent chat, RAG, knowledge discovery, artificial intelligence',
  authors: [{ name: 'magarsa AI Team' }],
  creator: 'magarsa',
  openGraph: {
    title: 'magarsa AI Research Assistant',
    description: 'Your intelligent research companion powered by advanced AI',
    type: 'website',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <div className="flex flex-col min-h-screen">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Research Assistant
                  </h1>
                  <p className="text-sm text-gray-500">
                    Document analysis and Q&A
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Online</span>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center text-sm text-gray-500">
                <p>Research Assistant - Document analysis and Q&A system</p>
                <p>Powered by AI</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}