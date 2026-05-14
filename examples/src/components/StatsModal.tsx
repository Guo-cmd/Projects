import React from 'react';
import { X, Activity } from 'lucide-react';
import { TimerStats, TimerData, TimerCategory } from '../types.ts';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TimerStats[];
  timers: TimerData[];
}

export function StatsModal({ isOpen, onClose, stats, timers }: StatsModalProps) {
  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];
  const todayStats = stats.filter(s => s.date === today);

  const categoryNames: Record<TimerCategory, string> = {
    work: '工作',
    study: '学习',
    exercise: '运动',
    meditation: '冥想',
    other: '其他'
  };

  const totalCompletions = stats.reduce((sum, stat) => sum + stat.completions, 0);
  const todayCompletions = todayStats.reduce((sum, stat) => sum + stat.completions, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">计时器统计</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">今日完成</h3>
            <p className="text-2xl font-bold text-indigo-600">{todayCompletions}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">总计完成</h3>
            <p className="text-2xl font-bold text-indigo-600">{totalCompletions}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">类别统计</h3>
          <div className="space-y-3">
            {Object.entries(categoryNames).map(([category, name]) => {
              const categoryStats = stats.filter(s => s.category === category);
              const completions = categoryStats.reduce((sum, stat) => sum + stat.completions, 0);
              const percentage = totalCompletions ? (completions / totalCompletions * 100).toFixed(1) : 0;

              return (
                <div key={category} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">{name}</span>
                    <span className="text-sm text-gray-500">{completions} 次完成</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">今日活跃计时器</h3>
          <div className="space-y-2">
            {timers.map(timer => {
              const todayCompletions = todayStats
                .find(s => s.category === timer.category)
                ?.completions || 0;

              return (
                <div key={timer.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{timer.name}</span>
                  <span className="text-sm text-gray-500">{todayCompletions} 次完成</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}