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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl animate-pulse">🤖</div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      magarsa AI Research Assistant
                    </h1>
                    <p className="text-sm text-gray-500">
                      Your intelligent research companion
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <span className="text-lg animate-pulse">🤖</span>
                  <p className="text-sm">
                    <strong>AI Research Assistant:</strong> Continuously learning and evolving with your knowledge
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-blue-200">
                  <span>🧠 Powered by Advanced AI</span>
                  <span className="hidden sm:inline">•</span>
                  <span>⚡ Next.js & FastAPI</span>
                  <span className="hidden sm:inline">•</span>
                  <span>🔒 Secure & Private</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}