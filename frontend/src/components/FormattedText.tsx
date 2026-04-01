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
    <div className={`space-y-2 ${className}`}>
      {structured.map((item, index) => {
        switch (item.type) {
          case 'heading':
          case 'subheading':
            return (
              <div key={index} className="font-semibold text-current mt-2">
                {item.content}
              </div>
            );
          
          case 'bullet':
            return (
              <div key={index} className="flex items-start space-x-2 text-current">
                <span className="flex-shrink-0">{item.emoji}</span>
                <div className="leading-relaxed">
                  {item.content.split('**').map((part, i) => 
                    i % 2 === 1 ? <span key={i} className="font-medium">{part}</span> : part
                  )}
                </div>
              </div>
            );
          
          case 'paragraph':
            return (
              <div key={index} className="leading-relaxed text-current">
                {item.content.split('**').map((part, i) => 
                  i % 2 === 1 ? <span key={i} className="font-medium">{part}</span> : part
                )}
              </div>
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