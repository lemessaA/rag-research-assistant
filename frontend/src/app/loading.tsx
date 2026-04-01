export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="text-6xl animate-bounce">🤖</div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">AI Research Assistant</h2>
          <p className="text-gray-600">Initializing AI systems...</p>
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-200"></div>
        </div>
        
        <div className="text-sm text-gray-500">
          Loading intelligent research capabilities...
        </div>
      </div>
    </div>
  );
}