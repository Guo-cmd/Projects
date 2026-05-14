import { useState, useEffect, useCallback } from 'react';
import { Timer } from '@/components/Timer';
import { SettingsPanel } from '@/components/SettingsPanel';
import { StatsDisplay } from '@/components/StatsDisplay';
import { TimerStatus, TimerSettings, Stats, Task, TaskCategory } from '@/types';
import { toast } from 'sonner';

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  dailyGoal: 8,
};

const DEFAULT_STATS: Stats = {
  todayCompleted: 0,
  totalCompleted: 0,
  lastUpdated: new Date().toISOString(),
  taskStats: {},
  categoryStats: {
    deep_work: { pomodoros: 0, minutes: 0 },
    shallow_work: { pomodoros: 0, minutes: 0 },
    meeting: { pomodoros: 0, minutes: 0 },
    learning: { pomodoros: 0, minutes: 0 },
    creative: { pomodoros: 0, minutes: 0 },
  }
};

export default function App() {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem('pomodoro-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [stats, setStats] = useState<Stats>(() => {
    const saved = localStorage.getItem('pomodoro-stats');
    if (!saved) return DEFAULT_STATS;
    
    const parsedStats: Stats = JSON.parse(saved);
    const lastDate = new Date(parsedStats.lastUpdated).toDateString();
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
      return { 
        ...DEFAULT_STATS, 
        totalCompleted: parsedStats.totalCompleted,
        taskStats: parsedStats.taskStats || {},
        categoryStats: parsedStats.categoryStats || DEFAULT_STATS.categoryStats,
        lastUpdated: new Date().toISOString() 
      };
    }
    return parsedStats;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('pomodoro-tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [status, setStatus] = useState<TimerStatus>('work');
  const [workCount, setWorkCount] = useState(() => {
    const saved = localStorage.getItem('pomodoro-work-count');
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('pomodoro-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pomodoro-work-count', workCount.toString());
  }, [workCount]);

  useEffect(() => {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pomodoro-stats', JSON.stringify(stats));
  }, [stats]);

  const handleTaskCreate = (name: string, category: TaskCategory) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name,
      category,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      totalPomodoros: 0
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const handleTaskUpdate = (taskId: string, pomodoros: number) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, totalPomodoros: t.totalPomodoros + pomodoros, lastUsed: new Date().toISOString() } 
        : t
    ).sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()));
  };

  const handleComplete = useCallback((completedStatus: TimerStatus, taskId: string | null) => {
    if (completedStatus === 'work') {
      const duration = settings.workDuration;
      let category: TaskCategory = 'deep_work';
      
      if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) category = task.category;
      }

      const updatedTaskStats = { ...(stats.taskStats || {}) };
      if (taskId) {
        updatedTaskStats[taskId] = {
          pomodoros: (updatedTaskStats[taskId]?.pomodoros || 0) + 1,
          minutes: (updatedTaskStats[taskId]?.minutes || 0) + duration
        };
      }

      const updatedCategoryStats = { ...(stats.categoryStats || DEFAULT_STATS.categoryStats) };
      updatedCategoryStats[category] = {
        pomodoros: (updatedCategoryStats[category]?.pomodoros || 0) + 1,
        minutes: (updatedCategoryStats[category]?.minutes || 0) + duration
      };

      const newStats = {
        ...stats,
        todayCompleted: stats.todayCompleted + 1,
        totalCompleted: stats.totalCompleted + 1,
        taskStats: updatedTaskStats,
        categoryStats: updatedCategoryStats,
        lastUpdated: new Date().toISOString()
      };
      setStats(newStats);
      
      const newWorkCount = workCount + 1;
      setWorkCount(newWorkCount);
      
      if (newWorkCount % 4 === 0) {
        setStatus('longBreak');
        toast.success('干得漂亮！来个长假吧！');
      } else {
        setStatus('break');
        toast.success('番茄钟完成，休息一下吧！');
      }
    } else {
      setStatus('work');
      toast('休息结束，开始专注吧！');
    }
  }, [stats, workCount, settings.workDuration, tasks]);

  const handleStatusChange = (newStatus: TimerStatus) => {
    setStatus(newStatus);
  };

  const handleSaveSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pomodoro-settings', JSON.stringify(newSettings));
    toast.success('设置已保存');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 md:p-12 bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="w-full max-w-2xl flex justify-between items-center z-10">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:rotate-12">
              <span className="text-primary-foreground font-bold text-xl">🍅</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">专注钟</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
                style={{ width: `${Math.min((stats.todayCompleted / settings.dailyGoal) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              目标: {stats.todayCompleted}/{settings.dailyGoal}
            </span>
          </div>
        </div>
        <SettingsPanel settings={settings} onSave={handleSaveSettings} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl z-10">
        <Timer 
          settings={settings} 
          status={status}
          onComplete={handleComplete} 
          onStatusChange={handleStatusChange}
          recentTasks={tasks}
          onTaskCreate={handleTaskCreate}
          onTaskUpdate={handleTaskUpdate}
        />
      </main>

      {/* Footer / Stats */}
      <footer className="w-full max-w-2xl flex flex-col items-center space-y-8 z-10">
        <StatsDisplay stats={stats} />
        <div className="flex flex-col items-center space-y-1">
          <p className="text-sm font-medium text-foreground/80">保持专注，高效生活</p>
          <p className="text-xs text-muted-foreground/60">番茄工作法助力您的每一个进步</p>
        </div>
      </footer>

      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px]"></div>
      </div>
    </div>
  );
}
