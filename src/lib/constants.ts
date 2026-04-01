import { ResearchModeInfo } from '@/types';

export const RESEARCH_MODES: ResearchModeInfo[] = [
  {
    value: 'research',
    label: 'Research',
    description: 'Precise, context-based answers',
    icon: '🔬',
  },
  {
    value: 'creative',
    label: 'Creative',
    description: 'Elaborate and engaging responses',
    icon: '🎨',
  },
  {
    value: 'conversational',
    label: 'Conversational',
    description: 'Friendly, natural dialogue',
    icon: '💬',
  },
  {
    value: 'analytical',
    label: 'Analytical',
    description: 'Detailed breakdown and insights',
    icon: '📊',
  },
  {
    value: 'tutor',
    label: 'Tutor',
    description: 'Educational, step-by-step explanations',
    icon: '👨‍🏫',
  },
];

export const SUPPORTED_FILE_TYPES = [
  'txt', 'md', 'pdf', 'docx', 'doc', 
  'xlsx', 'xls', 'pptx', 'ppt', 'html', 'htm'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB