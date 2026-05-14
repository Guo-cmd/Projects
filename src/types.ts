export type TimerStatus = 'work' | 'break' | 'longBreak';

export type TaskCategory = 'deep_work' | 'shallow_work' | 'meeting' | 'learning' | 'creative';

export interface Task {
  id: string;
  name: string;
  category: TaskCategory;
  createdAt: string;
  lastUsed: string;
  totalPomodoros: number;
}

export interface TimerSettings {
  workDuration: number; // minutes
  breakDuration: number; // minutes
  longBreakDuration: number; // minutes
  dailyGoal: number; // number of pomodoros
}

export interface PomodoroRecord {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  status: TimerStatus;
  interruptions: Interruption[];
}

export interface Interruption {
  reason: string;
  timestamp: string;
}

export interface Stats {
  todayCompleted: number;
  totalCompleted: number;
  lastUpdated: string;
  taskStats: Record<string, { pomodoros: number; minutes: number }>;
  categoryStats: Record<TaskCategory, { pomodoros: number; minutes: number }>;
}

export interface TimerSession {
  taskId: string | null;
  taskName: string | null;
  startTime: string | null;
  elapsedSeconds: number;
  totalDuration: number;
  isWorkPeriod: boolean;
  status: TimerStatus;
  isActive: boolean;
}
