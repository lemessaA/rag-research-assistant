import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RAG Research Assistant',
  description: 'Upload documents and ask questions about them using advanced AI',
  keywords: 'RAG, research, AI, documents, questions, answers',
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
                  <div className="text-2xl">🔍</div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      magarsa Research Assistant
                    </h1>
                    <p className="text-sm text-gray-500">
                      Upload documents and ask questions about them
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
          
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <p className="text-sm text-gray-500">
                  💡 <strong>Tip:</strong> The more documents you upload, the better the answers will be!
                </p>
                <p className="text-xs text-gray-400">
                  Powered by Next.js & FastAPI
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}