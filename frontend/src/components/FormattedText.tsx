'use client';

import { memo } from 'react';
import { parseStructuredResponse } from '@/lib/textFormatter';

interface FormattedTextProps {
  content: string;
  className?: string;
}

const FormattedText = memo(({ content, className = '' }: FormattedTextProps) => {
  const structured = parseStructuredResponse(content);

  return (
    <div className={`formatted-text ${className}`}>
      {structured.map((item, index) => {
        switch (item.type) {
          case 'heading':
            return (
              <h1 key={index} className="text-xl font-bold text-gray-900 mb-3 mt-2 border-b border-gray-200 pb-2">
                {item.content}
              </h1>
            );
          
          case 'subheading':
            return (
              <h2 key={index} className={`font-semibold text-gray-800 mb-2 mt-4 ${
                item.level === 2 ? 'text-lg' : 'text-base'
              }`}>
                {item.content}
              </h2>
            );
          
          case 'bullet':
            return (
              <div key={index} className="flex items-start space-x-2 mb-2 text-gray-700">
                <span className="text-base flex-shrink-0 mt-0.5">{item.emoji}</span>
                <span className="leading-relaxed">
                  {item.content.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
                  )}
                </span>
              </div>
            );
          
          case 'paragraph':
            return (
              <p key={index} className="text-gray-700 mb-3 leading-relaxed">
                {item.content.split('**').map((part, i) => 
                  i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
                )}
              </p>
            );
          
          default:
            return null;
        }
      })}
    </div>
  );
});

FormattedText.displayName = 'FormattedText';

export default FormattedText;