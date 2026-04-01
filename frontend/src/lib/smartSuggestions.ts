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
      text: "Use the Upload button above to add your first document",
      category: 'practical',
      mode: 'conversational',
      icon: '📁',
      priority: 8
    },
    {
      text: "What can you help me discover about my documents?",
      category: 'analysis',
      mode: 'conversational',
      icon: '🤖',
      priority: 7
    },
    {
      text: "What types of documents can I upload for analysis?",
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
    if (context.conversationLength <= 1) {
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
    if (context.conversationLength > 2) {
      suggestions.push(...this.conversationAwareSuggestions);
    }

    // Add mode-specific suggestions
    suggestions.push(...this.baseSuggestions.filter(s => s.mode === context.currentMode));

    // Add time-based suggestions
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
      .slice(0, 8); // Return top 8 suggestions
  }

  generateTopicBasedSuggestions(lastQuestion: string): SmartSuggestion[] {
    const topicSuggestions: SmartSuggestion[] = [];
    const questionLower = lastQuestion.toLowerCase();

    // Topic-specific follow-ups
    const topicKeywords = {
      'design': [
        {
          text: "What design principles should I consider?",
          category: 'analysis' as const,
          mode: 'research' as const,
          icon: '🎨',
          priority: 7
        },
        {
          text: "How can I improve the user experience?",
          category: 'practical' as const,
          mode: 'creative' as const,
          icon: '👤',
          priority: 6
        }
      ],
      'data': [
        {
          text: "What insights can be drawn from this data?",
          category: 'analysis' as const,
          mode: 'analytical' as const,
          icon: '📊',
          priority: 8
        },
        {
          text: "How should I visualize this information?",
          category: 'practical' as const,
          mode: 'creative' as const,
          icon: '📈',
          priority: 6
        }
      ],
      'process': [
        {
          text: "What are the potential bottlenecks in this process?",
          category: 'analysis' as const,
          mode: 'analytical' as const,
          icon: '🔍',
          priority: 7
        },
        {
          text: "How can this process be optimized?",
          category: 'practical' as const,
          mode: 'research' as const,
          icon: '⚡',
          priority: 6
        }
      ]
    };

    // Check for topic matches
    Object.entries(topicKeywords).forEach(([topic, suggestions]) => {
      if (questionLower.includes(topic)) {
        topicSuggestions.push(...suggestions);
      }
    });

    return topicSuggestions;
  }

  getContextualPrompts(context: SuggestionContext): SmartSuggestion[] {
    const followUpSuggestions: SmartSuggestion[] = [];
    const lastQuestion = context.lastUserQuestion;
    
    if (!lastQuestion) return [];

    const questionLower = lastQuestion.toLowerCase();

    // Contextual follow-ups based on question type
    if (questionLower.includes('what') || questionLower.includes('summary') || questionLower.includes('main')) {
      followUpSuggestions.push(
        {
          text: "Can you provide more specific details about this topic?",
          category: 'analysis',
          mode: 'research',
          icon: '🔍',
          priority: 8
        },
        {
          text: "What are the practical implications of this?",
          category: 'practical',
          mode: 'analytical',
          icon: '💡',
          priority: 7
        },
        {
          text: "How does this relate to other concepts in my documents?",
          category: 'comparison',
          mode: 'analytical',
          icon: '🔗',
          priority: 7
        }
      );
    }

    if (questionLower.includes('how') || questionLower.includes('process') || questionLower.includes('method')) {
      followUpSuggestions.push(
        {
          text: "What are the step-by-step instructions for this process?",
          category: 'practical',
          mode: 'tutor',
          icon: '📝',
          priority: 8
        },
        {
          text: "What challenges might I encounter with this approach?",
          category: 'analysis',
          mode: 'analytical',
          icon: '⚠️',
          priority: 7
        },
        {
          text: "Can you provide examples of this in practice?",
          category: 'creative',
          mode: 'creative',
          icon: '💫',
          priority: 6
        }
      );
    }

    if (questionLower.includes('why') || questionLower.includes('reason') || questionLower.includes('purpose')) {
      followUpSuggestions.push(
        {
          text: "What are the underlying principles behind this?",
          category: 'analysis',
          mode: 'analytical',
          icon: '🧠',
          priority: 8
        },
        {
          text: "How does this benefit users or organizations?",
          category: 'practical',
          mode: 'conversational',
          icon: '✨',
          priority: 7
        },
        {
          text: "What would happen if we didn't follow this approach?",
          category: 'analysis',
          mode: 'creative',
          icon: '🤔',
          priority: 6
        }
      );
    }

    if (questionLower.includes('compare') || questionLower.includes('difference') || questionLower.includes('versus')) {
      followUpSuggestions.push(
        {
          text: "Which approach would be most effective in practice?",
          category: 'practical',
          mode: 'analytical',
          icon: '🎯',
          priority: 8
        },
        {
          text: "What are the pros and cons of each option?",
          category: 'analysis',
          mode: 'analytical',
          icon: '⚖️',
          priority: 7
        },
        {
          text: "In what situations would each approach work best?",
          category: 'practical',
          mode: 'tutor',
          icon: '🎪',
          priority: 6
        }
      );
    }

    if (questionLower.includes('advantage') || questionLower.includes('benefit') || questionLower.includes('strength')) {
      followUpSuggestions.push(
        {
          text: "What are the potential disadvantages or limitations?",
          category: 'analysis',
          mode: 'analytical',
          icon: '⚠️',
          priority: 8
        },
        {
          text: "How can I maximize these benefits in my work?",
          category: 'practical',
          mode: 'conversational',
          icon: '🚀',
          priority: 7
        },
        {
          text: "Are there any trade-offs I should consider?",
          category: 'analysis',
          mode: 'research',
          icon: '🤝',
          priority: 6
        }
      );
    }

    if (questionLower.includes('problem') || questionLower.includes('challenge') || questionLower.includes('issue')) {
      followUpSuggestions.push(
        {
          text: "What solutions or alternatives are available?",
          category: 'practical',
          mode: 'research',
          icon: '💡',
          priority: 8
        },
        {
          text: "How can I prevent or mitigate these problems?",
          category: 'practical',
          mode: 'tutor',
          icon: '🛡️',
          priority: 7
        },
        {
          text: "What lessons can be learned from these challenges?",
          category: 'analysis',
          mode: 'analytical',
          icon: '📚',
          priority: 6
        }
      );
    }

    // Advanced contextual suggestions based on conversation flow
    if (context.conversationLength > 3) {
      followUpSuggestions.push(
        {
          text: "Can you elaborate further on that last point?",
          category: 'analysis',
          mode: 'conversational',
          icon: '🔍',
          priority: 6
        },
        {
          text: "How does this connect to what we discussed earlier?",
          category: 'comparison',
          mode: 'analytical',
          icon: '🔗',
          priority: 5
        },
        {
          text: "What's the next logical step I should explore?",
          category: 'practical',
          mode: 'conversational',
          icon: '➡️',
          priority: 5
        }
      );
    }

    return followUpSuggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 4);
  }

  getConversationContinuationSuggestions(context: SuggestionContext): SmartSuggestion[] {
    const continuations: SmartSuggestion[] = [];
    
    // Based on conversation length, suggest different types of questions
    if (context.conversationLength >= 2 && context.conversationLength <= 4) {
      continuations.push(
        {
          text: "What other related topics should I explore?",
          category: 'analysis',
          mode: 'conversational',
          icon: '🌟',
          priority: 7
        },
        {
          text: "Can you help me understand the bigger picture?",
          category: 'analysis',
          mode: 'analytical',
          icon: '🖼️',
          priority: 6
        }
      );
    } else if (context.conversationLength > 4) {
      continuations.push(
        {
          text: "Based on our discussion, what are the key takeaways?",
          category: 'analysis',
          mode: 'research',
          icon: '📝',
          priority: 8
        },
        {
          text: "What action items or next steps would you recommend?",
          category: 'practical',
          mode: 'tutor',
          icon: '✅',
          priority: 7
        },
        {
          text: "Are there any important aspects we haven't covered yet?",
          category: 'analysis',
          mode: 'conversational',
          icon: '🔍',
          priority: 6
        }
      );
    }

    return continuations;
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
  const suggestions = smartSuggestionEngine.generateSmartSuggestions(context);
  const contextualPrompts = smartSuggestionEngine.getContextualPrompts(context);
  const continuationSuggestions = smartSuggestionEngine.getConversationContinuationSuggestions(context);
  
  // Add topic-based suggestions if we have a recent question
  const topicSuggestions = context.lastUserQuestion 
    ? smartSuggestionEngine.generateTopicBasedSuggestions(context.lastUserQuestion)
    : [];
  
  // Combine and prioritize all suggestions
  const allSuggestions = [
    ...contextualPrompts,
    ...topicSuggestions,
    ...continuationSuggestions,
    ...suggestions
  ];
  
  // Remove duplicates and sort by priority
  const uniqueSuggestions = Array.from(
    new Map(allSuggestions.map(s => [s.text, s])).values()
  ).sort((a, b) => b.priority - a.priority);

  return {
    suggestions: uniqueSuggestions,
    contextualPrompts,
    continuationSuggestions,
    topicSuggestions,
    categorizedSuggestions: smartSuggestionEngine.getCategorizedSuggestions(context)
  };
}