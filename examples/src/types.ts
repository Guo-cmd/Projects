export type TimerCategory = 'work' | 'study' | 'exercise' | 'meditation' | 'other';

export type SoundOption = 'default' | 'bell' | 'digital' | 'gentle';

export interface TimerData {
  id: string;
  name: string;
  duration: number;
  remaining: number;
  isRunning: boolean;
  category: TimerCategory;
  createdAt: string;
  completions: number;
}

export interface TimerTemplate {
  name: string;
  duration: number;
  category: TimerCategory;
}

export interface TimerStats {
  date: string;
  category: TimerCategory;
  completions: number;
}