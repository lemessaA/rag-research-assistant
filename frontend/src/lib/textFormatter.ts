// Simple text formatter for clean display
export function formatAIResponse(content: string): string {
  return content
    // Convert markdown headings to clean text
    .replace(/^### (.*$)/gm, '$1')
    .replace(/^## (.*$)/gm, '$1')  
    .replace(/^# (.*$)/gm, '$1')
    
    // Convert markdown bold to clean text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    
    // Convert markdown italic to clean text
    .replace(/\*(.*?)\*/g, '$1')
    
    // Clean up extra spaces and newlines
    .replace(/\n\n\n+/g, '\n\n')
    .trim();
}

export function parseStructuredResponse(content: string) {
  const lines = content.split('\n');
  const structured: {
    type: 'heading' | 'subheading' | 'bullet' | 'paragraph';
    content: string;
    level?: number;
    emoji?: string;
  }[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Parse headings
    if (line.startsWith('### ')) {
      structured.push({
        type: 'subheading',
        content: line.replace('### ', ''),
        level: 3
      });
    } else if (line.startsWith('## ')) {
      structured.push({
        type: 'subheading', 
        content: line.replace('## ', ''),
        level: 2
      });
    } else if (line.startsWith('# ')) {
      structured.push({
        type: 'heading',
        content: line.replace('# ', ''),
        level: 1
      });
    }
    // Parse bullet points with emojis
    else if (line.match(/^[-*]\s*[✅🔥💡📊⚠️🎯]/)) {
      const emojiMatch = line.match(/^[-*]\s*([✅🔥💡📊⚠️🎯])/);
      const emoji = emojiMatch?.[1] || '';
      const content = line.replace(/^[-*]\s*[✅🔥💡📊⚠️🎯]\s*/, '');
      
      structured.push({
        type: 'bullet',
        content: content.replace(/\*\*(.*?)\*\*/g, '$1'), // Remove bold markdown
        emoji
      });
    }
    // Regular paragraphs
    else {
      structured.push({
        type: 'paragraph',
        content: line.replace(/\*\*(.*?)\*\*/g, '$1')
      });
    }
  }

  return structured;
}