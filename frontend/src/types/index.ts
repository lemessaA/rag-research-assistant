export interface Source {
  title: string;
  content: string;
  score: number;
}

export interface ResearchResponse {
  answer: string;
  sources: Source[];
}

export interface ResearchRequest {
  question: string;
  mode: ResearchMode;
}

export interface UploadResponse {
  message: string;
  filename: string;
  chunks_created: number;
}

export type ResearchMode = 
  | 'research' 
  | 'creative' 
  | 'conversational' 
  | 'analytical' 
  | 'tutor';

export interface ResearchModeInfo {
  value: ResearchMode;
  label: string;
  description: string;
  icon: string;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  chunksCreated?: number;
}