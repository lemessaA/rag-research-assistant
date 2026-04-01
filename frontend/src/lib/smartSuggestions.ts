import { ResearchMode, UploadedFile } from '@/types';

export interface SmartSuggestion {
  text: string;
  category: 'analysis' | 'comparison' | 'extraction' | 'creative' | 'practical';
  mode: ResearchMode;
  icon: string;
  priority: number;
}

export interface SuggestionContext {
  uploadedFiles: UploadedFile[];
  conversationLength: number;
  lastUserQuestion?: string;
  currentMode: ResearchMode;
  hasMultipleFiles: boolean;
  fileTypes: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}

class SmartSuggestionEngine {
  private baseSuggestions: SmartSuggestion[] = [
    // Analysis Suggestions
    {
      text: "What are the key themes and patterns across my documents?",
      category: 'analysis',
      mode: 'analytical',
      icon: '🔍',
      priority: 9
    },
    {
      text: "Identify the most important insights from my knowledge base",
      category: 'analysis', 
      mode: 'research',
      icon: '💡',
      priority: 8
    },
    {
      text: "What are the main arguments or conclusions presented?",
      category: 'analysis',
      mode: 'analytical',
      icon: '📊',
      priority: 7
    },

    // Comparison Suggestions  
    {
      text: "Compare and contrast the different perspectives in my documents",
      category: 'comparison',
      mode: 'analytical',
      icon: '⚖️',
      priority: 8
    },
    {
      text: "What are the similarities and differences between the files?",
      category: 'comparison',
      mode: 'research',
      icon: '🔄',
      priority: 7
    },

    // Extraction Suggestions
    {
      text: "Extract all the key facts and statistics mentioned",
      category: 'extraction',
      mode: 'research',
      icon: '📋',
      priority: 6
    },
    {
      text: "List all the important definitions and terminology",
      category: 'extraction',
      mode: 'research',
      icon: '📖',
      priority: 5
    },
    {
      text: "What are all the recommendations or action items mentioned?",
      category: 'extraction',
      mode: 'analytical',
      icon: '✅',
      priority: 6
    },

    // Creative Suggestions
    {
      text: "Create an engaging summary that tells the story of my documents",
      category: 'creative',
      mode: 'creative',
      icon: '🎨',
      priority: 6
    },
    {
      text: "Explain this content as if teaching it to a beginner",
      category: 'creative',
      mode: 'tutor',
      icon: '🎓',
      priority: 5
    },

    // Practical Suggestions
    {
      text: "What practical applications can I derive from this information?",
      category: 'practical',
      mode: 'conversational',
      icon: '🛠️',
      priority: 7
    },
    {
      text: "How can I apply these insights to real-world scenarios?",
      category: 'practical',
      mode: 'analytical',
      icon: '🌍',
      priority: 6
    }
  ];

  private fileTypeSpecificSuggestions: Record<string, SmartSuggestion[]> = {
    'pdf': [
      {
        text: "Summarize the main sections and chapters of this document",
        category: 'analysis',
        mode: 'research',
        icon: '📄',
        priority: 8
      },
      {
        text: "What are the key findings from this research paper?",
        category: 'extraction',
        mode: 'research',
        icon: '🔬',
        priority: 7
      }
    ],
    'docx': [
      {
        text: "Extract the main proposals or recommendations from this document",
        category: 'extraction',
        mode: 'analytical',
        icon: '📝',
        priority: 7
      }
    ],
    'xlsx': [
      {
        text: "Analyze the data trends and patterns in these spreadsheets",
        category: 'analysis',
        mode: 'analytical',
        icon: '📈',
        priority: 9
      },
      {
        text: "What insights can be drawn from the numerical data?",
        category: 'analysis',
        mode: 'research',
        icon: '🔢',
        priority: 8
      }
    ],
    'pptx': [
      {
        text: "Summarize the key points from this presentation",
        category: 'extraction',
        mode: 'research',
        icon: '📊',
        priority: 8
      }
    ]
  };

  private conversationAwareSuggestions: SmartSuggestion[] = [
    {
      text: "Can you elaborate on that last point in more detail?",
      category: 'analysis',
      mode: 'conversational',
      icon: '🔍',
      priority: 7
    },
    {
      text: "What are the implications of what we just discussed?",
      category: 'analysis',
      mode: 'analytical',
      icon: '💭',
      priority: 6
    },
    {
      text: "How does this connect to the broader themes in my documents?",
      category: 'comparison',
      mode: 'analytical',
      icon: '🔗',
      priority: 8
    },
    {
      text: "Can you provide examples to illustrate these concepts?",
      category: 'creative',
      mode: 'tutor',
      icon: '💡',
      priority: 5
    }
  ];

  private greetingSuggestions: SmartSuggestion[] = [
    {
      text: "What can you help me discover about my documents?",
      category: 'analysis',
      mode: 'conversational',
      icon: '🤖',
      priority: 8
    },
    {
      text: "Show me the most interesting insights from my knowledge base",
      category: 'analysis',
      mode: 'research',
      icon: '✨',
      priority: 7
    },
    {
      text: "What questions should I be asking about my uploaded content?",
      category: 'practical',
      mode: 'conversational',
      icon: '❓',
      priority: 6
    }
  ];

  generateSmartSuggestions(context: SuggestionContext): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    
    // If no files uploaded, show greeting suggestions
    if (context.uploadedFiles.length === 0) {
      return this.greetingSuggestions.slice(0, 3);
    }

    // If conversation just started, show general analysis suggestions
    if (context.conversationLength <= 2) {
      suggestions.push(...this.baseSuggestions.filter(s => 
        s.category === 'analysis' || s.category === 'extraction'
      ));
    }

    // Add file type specific suggestions
    context.fileTypes.forEach(fileType => {
      const typeSuggestions = this.fileTypeSpecificSuggestions[fileType];
      if (typeSuggestions) {
        suggestions.push(...typeSuggestions);
      }
    });

    // Add comparison suggestions for multiple files
    if (context.hasMultipleFiles) {
      suggestions.push(...this.baseSuggestions.filter(s => s.category === 'comparison'));
    }

    // Add conversation-aware suggestions for ongoing chats
    if (context.conversationLength > 3) {
      suggestions.push(...this.conversationAwareSuggestions);
    }

    // Add mode-specific suggestions
    suggestions.push(...this.baseSuggestions.filter(s => s.mode === context.currentMode));

    // Add creative suggestions based on time of day
    if (context.timeOfDay === 'morning') {
      suggestions.push(...this.baseSuggestions.filter(s => s.category === 'analysis'));
    } else if (context.timeOfDay === 'afternoon') {
      suggestions.push(...this.baseSuggestions.filter(s => s.category === 'practical'));
    } else {
      suggestions.push(...this.baseSuggestions.filter(s => s.category === 'creative'));
    }

    // Remove duplicates and sort by priority
    const uniqueSuggestions = Array.from(
      new Map(suggestions.map(s => [s.text, s])).values()
    );

    return uniqueSuggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 6); // Return top 6 suggestions
  }

  getContextualPrompts(lastQuestion?: string): SmartSuggestion[] {
    if (!lastQuestion) return [];

    const followUpSuggestions: SmartSuggestion[] = [];

    // Analyze the last question for follow-up opportunities
    const questionLower = lastQuestion.toLowerCase();

    if (questionLower.includes('what') || questionLower.includes('summary')) {
      followUpSuggestions.push({
        text: "Can you provide more specific details about this topic?",
        category: 'analysis',
        mode: 'research',
        icon: '🔍',
        priority: 8
      });
    }

    if (questionLower.includes('how') || questionLower.includes('process')) {
      followUpSuggestions.push({
        text: "What are the step-by-step instructions for this process?",
        category: 'practical',
        mode: 'tutor',
        icon: '📝',
        priority: 7
      });
    }

    if (questionLower.includes('compare') || questionLower.includes('difference')) {
      followUpSuggestions.push({
        text: "Which approach would be most effective in practice?",
        category: 'practical',
        mode: 'analytical',
        icon: '🎯',
        priority: 8
      });
    }

    return followUpSuggestions.slice(0, 3);
  }

  getCategorizedSuggestions(context: SuggestionContext): Record<string, SmartSuggestion[]> {
    const allSuggestions = this.generateSmartSuggestions(context);
    
    return {
      analysis: allSuggestions.filter(s => s.category === 'analysis').slice(0, 2),
      comparison: allSuggestions.filter(s => s.category === 'comparison').slice(0, 2),
      extraction: allSuggestions.filter(s => s.category === 'extraction').slice(0, 2),
      creative: allSuggestions.filter(s => s.category === 'creative').slice(0, 2),
      practical: allSuggestions.filter(s => s.category === 'practical').slice(0, 2)
    };
  }
}

export const smartSuggestionEngine = new SmartSuggestionEngine();

export function useSmartSuggestions(context: SuggestionContext) {
  return {
    suggestions: smartSuggestionEngine.generateSmartSuggestions(context),
    contextualPrompts: smartSuggestionEngine.getContextualPrompts(context.lastUserQuestion),
    categorizedSuggestions: smartSuggestionEngine.getCategorizedSuggestions(context)
  };
}