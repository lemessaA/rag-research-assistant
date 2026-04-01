'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer = memo(({ content, className = '' }: MarkdownRendererProps) => {
  return (
    <div className={`chat-prose ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom heading styles for chat
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-gray-900 mb-3 mt-1 border-b border-gray-200 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-gray-800 mb-2 mt-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-gray-700 mb-2 mt-2">
              {children}
            </h3>
          ),
          
          // Custom list styles - preserve emojis and format nicely
          ul: ({ children }) => (
            <ul className="space-y-1.5 mb-3 ml-0">{children}</ul>
          ),
          li: ({ children }) => {
            // Convert children to string to check for emojis
            const childText = children?.toString() || '';
            
            return (
              <li className="flex items-start text-gray-700 leading-relaxed">
                <span className="block">{children}</span>
              </li>
            );
          },
          
          // Custom paragraph styles
          p: ({ children }) => (
            <p className="text-gray-700 mb-2 leading-relaxed last:mb-0">{children}</p>
          ),
          
          // Bold text styling
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),
          
          // Italic text styling
          em: ({ children }) => (
            <em className="italic text-gray-600">{children}</em>
          ),
          
          // Code styling
          code: ({ children }) => (
            <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">
              {children}
            </code>
          ),
          
          // Ordered lists
          ol: ({ children }) => (
            <ol className="space-y-1.5 mb-3 ml-4 list-decimal">{children}</ol>
          ),
          
          // Tables
          table: ({ children }) => (
            <table className="w-full border-collapse border border-gray-300 mb-4">
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-3 py-2 bg-gray-100 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-3 py-2">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;