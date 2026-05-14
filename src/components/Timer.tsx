import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Target, Maximize2, Minimize2 } from 'lucide-react';
import { TaskBinder } from './TaskBinder';
import { InterruptionLogger } from './InterruptionLogger';
import { Task, TaskCategory, TimerStatus, TimerSettings } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TimerProps {
  settings: TimerSettings;
  onComplete: (status: TimerStatus, taskId: string | null) => void;
  status: TimerStatus;
  onStatusChange: (status: TimerStatus) => void;
  recentTasks: Task[];
  onTaskCreate: (name: string, category: TaskCategory) => Task;
  onTaskUpdate: (taskId: string, pomodoros: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ 
  settings, 
  onComplete, 
  status, 
  onStatusChange,
  recentTasks,
  onTaskCreate,
  onTaskUpdate
}) => {
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isBinderOpen, setIsBinderOpen] = useState(false);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [isImmersionMode, setIsImmersionMode] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Audio references for end of timer
  const workEndAudio = useRef<HTMLAudioElement | null>(null);
  const breakEndAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    workEndAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    breakEndAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
  }, []);

  const getInitialTime = useCallback((currentStatus: TimerStatus) => {
    switch (currentStatus) {
      case 'work': return settings.workDuration * 60;
      case 'break': return settings.breakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
      default: return settings.workDuration * 60;
    }
  }, [settings]);

  const resetToInitial = useCallback(() => {
    setIsActive(false);
    setIsStarted(false);
    setCurrentTask(null);
    setTimeLeft(getInitialTime(status));
    localStorage.removeItem('pomodoro-session-recovery');
  }, [getInitialTime, status]);

  // Load session from recovery on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('pomodoro-session-recovery');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      const now = Date.now();
      const elapsedSinceSave = Math.floor((now - session.timestamp) / 1000);
      
      if (session.timeLeft > elapsedSinceSave) {
        toast('发现进行中的会话，已自动恢复', {
          action: {
            label: '重置',
            onClick: () => resetToInitial()
          }
        });
        
        if (session.taskId) {
          const task = recentTasks.find(t => t.id === session.taskId);
          if (task) setCurrentTask(task);
        }
        
        setTimeLeft(session.timeLeft - elapsedSinceSave);
        setIsStarted(true);
        setIsActive(true);
        onStatusChange(session.status);
      } else {
        localStorage.removeItem('pomodoro-session-recovery');
      }
    }
  }, [recentTasks, onStatusChange, resetToInitial]);

  useEffect(() => {
    if (!isStarted) {
      setIsActive(false);
      setTimeLeft(getInitialTime(status));
    }
  }, [status, getInitialTime, isStarted]);

  useEffect(() => {
    if (!isActive && !isStarted) {
      setTimeLeft(getInitialTime(status));
    }
  }, [settings, getInitialTime, status, isActive, isStarted]);

  useEffect(() => {
    if (isImmersionMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isImmersionMode]);

  const saveSessionToLocal = useCallback(() => {
    if (isStarted) {
      const session = {
        taskId: currentTask?.id,
        taskName: currentTask?.name,
        timeLeft,
        status,
        timestamp: Date.now()
      };
      localStorage.setItem('pomodoro-session-recovery', JSON.stringify(session));
    } else {
      localStorage.removeItem('pomodoro-session-recovery');
    }
  }, [isStarted, currentTask, timeLeft, status]);

  const startTimer = () => {
    if (status === 'work' && !currentTask) {
      setIsBinderOpen(true);
      return;
    }
    setIsStarted(true);
    setIsActive(true);
  };

  const handleSelectTask = (task: Task) => {
    setCurrentTask(task);
    setIsBinderOpen(false);
    setIsStarted(true);
    setIsActive(true);
  };

  const handleCreateAndSelect = (name: string, category: TaskCategory) => {
    const task = onTaskCreate(name, category);
    handleSelectTask(task);
  };

  const togglePause = () => {
    if (isActive) {
      setIsLoggerOpen(true);
      setIsActive(false);
    } else {
      setIsActive(true);
    }
  };

  const handleLogInterruption = (reason: string) => {
    console.log(`Interruption reason: ${reason}`);
    setIsLoggerOpen(false);
    toast.info(`记录原因: ${reason}. 专注力准备中...`);
    setTimeout(() => {
      setIsActive(true);
    }, 2000);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (timeLeft % 30 === 0) {
          saveSessionToLocal();
        }
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsStarted(false);
      
      if (status === 'work') {
        workEndAudio.current?.play().catch(() => {});
        if (currentTask) {
          onTaskUpdate(currentTask.id, 1);
        }
      } else {
        breakEndAudio.current?.play().catch(() => {});
      }

      onComplete(status, currentTask?.id || null);
      setCurrentTask(null);
      if (timerRef.current) window.clearInterval(timerRef.current);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, status, onComplete, currentTask, onTaskUpdate, saveSessionToLocal]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const statusLabel = {
    work: '工作中',
    break: '短休息',
    longBreak: '长假'
  };

  return (
    <div className={cn(
      "flex flex-col items-center space-y-16 py-8 transition-all duration-1000",
      isImmersionMode && "fixed inset-0 z-[100] bg-background justify-center py-0 space-y-24"
    )}>
      {isImmersionMode && (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-to-br from-primary/10 via-background to-secondary/10 animate-[spin_20s_linear_infinite]" />
        </div>
      )}

      {isStarted && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsImmersionMode(!isImmersionMode)}
          className={cn(
            "fixed top-8 right-8 z-[110] rounded-full bg-muted/20 hover:bg-muted/40",
            !isImmersionMode && "relative top-0 right-0 mb-[-4rem]"
          )}
        >
          {isImmersionMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      )}

      {currentTask && isStarted && (
        <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-fade-in">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-primary">{currentTask.name}</span>
        </div>
      )}

      <div className="flex p-1 bg-muted/30 rounded-full backdrop-blur-sm border border-border/40">
        {(['work', 'break', 'longBreak'] as TimerStatus[]).map((s) => (
          <Button
            key={s}
            variant="ghost"
            size="sm"
            onClick={() => {
              if (status !== s) {
                onStatusChange(s);
              }
            }}
            className={cn(
              "px-6 py-2 h-auto rounded-full transition-all duration-300 font-medium",
              status === s 
                ? "bg-background text-foreground shadow-sm scale-105" 
                : "text-muted-foreground hover:text-foreground hover:bg-transparent"
            )}
          >
            {statusLabel[s]}
          </Button>
        ))}
      </div>

      <div className="relative group">
         <div className="absolute -inset-8 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
         <div className="text-[10rem] md:text-[12rem] font-mono-timer font-bold tracking-tighter leading-none select-none relative transition-transform duration-500 hover:scale-[1.02]">
            {formatTime(timeLeft)}
         </div>
      </div>

      <div className="flex items-center space-x-6">
        <Button
          onClick={startTimer}
          disabled={isStarted}
          className={cn(
            "h-14 px-10 text-lg font-semibold rounded-2xl shadow-lg transition-all active:scale-95",
            isStarted ? "bg-muted text-muted-foreground shadow-none" : "shadow-primary/20 hover:shadow-primary/30"
          )}
        >
          <Play className={cn("mr-2 h-5 w-5 fill-current", isStarted && "opacity-50")} /> 开始
        </Button>

        <Button
          onClick={togglePause}
          disabled={!isStarted}
          variant="outline"
          className={cn(
            "h-14 px-10 text-lg font-semibold rounded-2xl border-2 transition-all active:scale-95",
            !isStarted ? "bg-muted/10 text-muted-foreground opacity-50 grayscale" : "hover:bg-accent hover:border-primary/20"
          )}
        >
          {isActive ? (
            <>
              <Pause className="mr-2 h-5 w-5 fill-current" /> 暂停
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5 fill-current" /> 继续
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={resetToInitial}
          disabled={!isStarted}
          className={cn(
            "h-14 w-14 rounded-2xl border-2 transition-all active:rotate-180",
            !isStarted ? "bg-muted/10 text-muted-foreground opacity-50 grayscale" : "hover:bg-accent hover:border-primary/20"
          )}
        >
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>

      <TaskBinder 
        isOpen={isBinderOpen}
        onClose={() => setIsBinderOpen(false)}
        recentTasks={recentTasks}
        onSelectTask={handleSelectTask}
        onCreateAndSelect={handleCreateAndSelect}
      />

      <InterruptionLogger 
        isOpen={isLoggerOpen}
        onSelectReason={handleLogInterruption}
        onClose={() => setIsLoggerOpen(false)}
      />
    </div>
  );
};
