import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { TimerTemplate, TimerCategory } from '../types.ts';

interface AddTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, duration: number, category: TimerCategory) => void;
  templates: TimerTemplate[];
}

export function AddTimerModal({ isOpen, onClose, onAdd, templates }: AddTimerModalProps) {
  const [name, setName] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [category, setCategory] = useState<TimerCategory>('work');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSeconds = 
      parseInt(hours || '0') * 3600 + 
      parseInt(minutes || '0') * 60 + 
      parseInt(seconds || '0');
    
    if (name && totalSeconds > 0) {
      onAdd(name, totalSeconds, category);
      setName('');
      setHours('0');
      setMinutes('0');
      setSeconds('0');
      setCategory('work');
      onClose();
    }
  };

  const handleTemplateClick = (template: TimerTemplate) => {
    setName(template.name);
    const totalSeconds = template.duration * 60;
    setHours(Math.floor(totalSeconds / 3600).toString());
    setMinutes(Math.floor((totalSeconds % 3600) / 60).toString());
    setSeconds('0');
    setCategory(template.category);
  };

  const categoryNames: Record<TimerCategory, string> = {
    work: '工作',
    study: '学习',
    exercise: '运动',
    meditation: '冥想',
    other: '其他'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">添加新计时器</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">快速模板</h3>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template, index) => (
              <button
                key={index}
                onClick={() => handleTemplateClick(template)}
                className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-700">{template.name}</div>
                <div className="text-sm text-gray-500">{template.duration} 分钟</div>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              计时器名称
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例如：番茄工作法"
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
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  placeholder="0"
                />
                <span className="text-sm text-gray-500 mt-1 block text-center">小时</span>
              </div>
              <div>
                <input
                  type="number"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
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
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  max="59"
                  placeholder="0"
                />
                <span className="text-sm text-gray-500 mt-1 block text-center">秒</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              类别
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TimerCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(categoryNames).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}