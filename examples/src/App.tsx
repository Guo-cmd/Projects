import React, { useState, useEffect } from 'react';
import { Timer, PlusCircle, Volume2, VolumeX, BarChart2, Settings } from 'lucide-react';
import { TimerCard } from './components/TimerCard.tsx';
import { AddTimerModal } from './components/AddTimerModal.tsx';
import { StatsModal } from './components/StatsModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { TIMER_TEMPLATES } from './constants.ts';
import { TimerData, TimerCategory, SoundOption, TimerStats } from './types.ts';

function App() {
  const [timers, setTimers] = useState<TimerData[]>(() => {
    const saved = localStorage.getItem('timers');
    return saved ? JSON.parse(saved) : [];
  });
  const [stats, setStats] = useState<TimerStats[]>(() => {
    const saved = localStorage.getItem('timerStats');
    return saved ? JSON.parse(saved) : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TimerCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'duration' | 'remaining'>('name');
  const [soundOption, setSoundOption] = useState<SoundOption>('default');

  useEffect(() => {
    localStorage.setItem('timers', JSON.stringify(timers));
  }, [timers]);

  useEffect(() => {
    localStorage.setItem('timerStats', JSON.stringify(stats));
  }, [stats]);

  const addTimer = (name: string, duration: number, category: TimerCategory) => {
    const newTimer: TimerData = {
      id: crypto.randomUUID(),
      name,
      duration: duration,
      remaining: duration,
      isRunning: false,
      category,
      createdAt: new Date().toISOString(),
      completions: 0
    };
    setTimers([...timers, newTimer]);
  };

  const removeTimer = (id: string) => {
    setTimers(timers.filter(timer => timer.id !== id));
  };

  const toggleTimer = (id: string) => {
    setTimers(timers.map(timer => 
      timer.id === id ? { ...timer, isRunning: !timer.isRunning } : timer
    ));
  };

  const updateRemaining = (id: string, remaining: number) => {
    setTimers(timers.map(timer => {
      if (timer.id === id) {
        if (remaining === 0) {
          const newCompletions = timer.completions + 1;
          updateStats(timer.category);
          return { ...timer, remaining, completions: newCompletions };
        }
        return { ...timer, remaining };
      }
      return timer;
    }));
  };

  const updateStats = (category: TimerCategory) => {
    const today = new Date().toISOString().split('T')[0];
    setStats(prevStats => {
      const existingStat = prevStats.find(s => s.date === today && s.category === category);
      if (existingStat) {
        return prevStats.map(s => 
          s.date === today && s.category === category
            ? { ...s, completions: s.completions + 1 }
            : s
        );
      }
      return [...prevStats, { date: today, category, completions: 1 }];
    });
  };

  const resetTimer = (id: string) => {
    setTimers(timers.map(timer => 
      timer.id === id ? { ...timer, remaining: timer.duration, isRunning: false } : timer
    ));
  };

  const editTimer = (id: string, name: string, duration: number, category: TimerCategory) => {
    setTimers(timers.map(timer => {
      if (timer.id === id) {
        return {
          ...timer,
          name,
          category,
          duration: duration,
          remaining: duration,
        };
      }
      return timer;
    }));
  };

  const filteredTimers = timers
    .filter(timer => selectedCategory === 'all' || timer.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'duration':
          return b.duration - a.duration;
        case 'remaining':
          return a.remaining - b.remaining;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Timer className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">多功能计时器</h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsStatsOpen(true)}
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
              title="统计数据"
            >
              <BarChart2 className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
              title="设置"
            >
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
              title={isMuted ? "开启声音" : "静音"}
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-gray-600" />
              ) : (
                <Volume2 className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              <span>添加计时器</span>
            </button>
          </div>
        </div>

        <div className="mb-6 flex gap-4 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as TimerCategory | 'all')}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">所有类别</option>
            <option value="work">工作</option>
            <option value="study">学习</option>
            <option value="exercise">运动</option>
            <option value="meditation">冥想</option>
            <option value="other">其他</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'duration' | 'remaining')}
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="name">按名称排序</option>
            <option value="duration">按时长排序</option>
            <option value="remaining">按剩余时间排序</option>
          </select>
        </div>

        {timers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <Timer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl text-gray-600">暂无计时器</h2>
            <p className="text-gray-400 mt-2">点击"添加计时器"按钮创建您的第一个计时器</p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto px-4">
              {TIMER_TEMPLATES.map((template, index) => (
                <button
                  key={index}
                  onClick={() => {
                    addTimer(template.name, template.duration * 60, template.category);
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-700">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.duration} 分钟</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTimers.map(timer => (
              <TimerCard
                key={timer.id}
                timer={timer}
                onToggle={toggleTimer}
                onReset={resetTimer}
                onRemove={removeTimer}
                onUpdate={updateRemaining}
                onEdit={editTimer}
                isMuted={isMuted}
                soundOption={soundOption}
              />
            ))}
          </div>
        )}

        <AddTimerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addTimer}
          templates={TIMER_TEMPLATES}
        />

        <StatsModal
          isOpen={isStatsOpen}
          onClose={() => setIsStatsOpen(false)}
          stats={stats}
          timers={timers}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          soundOption={soundOption}
          onSoundOptionChange={setSoundOption}
          isMuted={isMuted}
          onMutedChange={setIsMuted}
        />
      </div>
    </div>
  );
}

export default App;