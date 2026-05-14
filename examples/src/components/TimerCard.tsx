import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, X, Edit2 } from 'lucide-react';
import type { TimerData, TimerCategory, SoundOption } from '../types.ts';
import { SOUND_URLS } from '../constants.ts';

interface TimerCardProps {
  timer: TimerData;
  onToggle: (id: string) => void;
  onReset: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, remaining: number) => void;
  onEdit: (id: string, name: string, duration: number, category: TimerCategory) => void;
  isMuted: boolean;
  soundOption: SoundOption;
}

export function TimerCard({
  timer,
  onToggle,
  onReset,
  onRemove,
  onUpdate,
  onEdit,
  isMuted,
  soundOption
}: TimerCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(timer.name);
  const [editHours, setEditHours] = useState(Math.floor(timer.duration / 3600).toString());
  const [editMinutes, setEditMinutes] = useState(Math.floor((timer.duration % 3600) / 60).toString());
  const [editSeconds, setEditSeconds] = useState((timer.duration % 60).toString());
  const [editCategory, setEditCategory] = useState(timer.category);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<number>();

  useEffect(() => {
    setEditHours(Math.floor(timer.duration / 3600).toString());
    setEditMinutes(Math.floor((timer.duration % 3600) / 60).toString());
    setEditSeconds((timer.duration % 60).toString());
  }, [timer.duration]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSeconds = 
      parseInt(editHours || '0') * 3600 + 
      parseInt(editMinutes || '0') * 60 + 
      parseInt(editSeconds || '0');
    
    if (totalSeconds > 0) {
      onEdit(timer.id, editName, totalSeconds, editCategory);
      setIsEditing(false);
    }
  };

  const progress = (timer.remaining / timer.duration) * 100;
  const isNearEnd = timer.remaining <= 10 && timer.isRunning;

  const categoryNames: Record<TimerCategory, string> = {
    work: '工作',
    study: '学习',
    exercise: '运动',
    meditation: '冥想',
    other: '其他'
  };

  useEffect(() => {
    if (timer.isRunning) {
      intervalRef.current = window.setInterval(() => {
        if (timer.remaining > 0) {
          onUpdate(timer.id, timer.remaining - 1);
          if (timer.remaining <= 4 && !isMuted && audioRef.current) {
            audioRef.current.play();
          }
        } else {
          onToggle(timer.id);
          if (!isMuted && audioRef.current) {
            audioRef.current.src = SOUND_URLS[soundOption];
            audioRef.current.play();
          }
          if (Notification.permission === 'granted') {
            new Notification('计时完成！', {
              body: `${timer.name}已完成！`,
              icon: '/vite.svg'
            });
          }
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isRunning, timer.remaining, timer.id, onUpdate, onToggle, isMuted, soundOption]);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleEditSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              计时器名称
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              持续时间
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  type="number"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  placeholder="0"
                />
                <span className="text-sm text-gray-500 mt-1 block text-center">小时</span>
              </div>
              <div>
                <input
                  type="number"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  max="59"
                  placeholder="0"
                />
                <span className="text-sm text-gray-500 mt-1 block text-center">分钟</span>
              </div>
              <div>
                <input
                  type="number"
                  value={editSeconds}
                  onChange={(e) => setEditSeconds(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  max="59"
                  placeholder="0"
                />
                <span className="text-sm text-gray-500 mt-1 block text-center">秒</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              类别
            </label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value as TimerCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(categoryNames).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${isNearEnd ? 'animate-pulse' : ''}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{timer.name}</h3>
            <span className="text-sm text-gray-500">{categoryNames[timer.category]}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="编辑"
            >
              <Edit2 className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={() => onRemove(timer.id)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="删除"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className={`text-4xl font-mono text-center my-8 font-bold ${isNearEnd ? 'text-red-600' : 'text-gray-700'}`}>
          {formatTime(timer.remaining)}
        </div>

        <div className="h-2 bg-gray-100 rounded-full mb-6">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isNearEnd ? 'bg-red-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => onToggle(timer.id)}
            className={`p-3 rounded-full text-white transition-colors ${
              timer.isRunning 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            title={timer.isRunning ? "暂停" : "开始"}
          >
            {timer.isRunning ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => onReset(timer.id)}
            className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="重置"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          已完成 {timer.completions} 次
        </div>
      </div>

      <audio ref={audioRef}>
        <source src={SOUND_URLS[soundOption]} type="audio/mpeg" />
      </audio>
    </div>
  );
}