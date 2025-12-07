export type AspectRatio = '1:1' | '3:4' | '16:9' | '4:3' | '9:16';
export type QualityLevel = 'basic' | 'standard' | 'hd';

export interface GenerationConfig {
  prompt: string;
  aspectRatio: AspectRatio;
  quality: QualityLevel;
  images: File[];
}

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
}

export interface GenerationError {
  message: string;
  code?: string;
}
