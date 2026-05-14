import React from 'react';
import { X, Settings } from 'lucide-react';
import { SoundOption } from '../types.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundOption: SoundOption;
  onSoundOptionChange: (option: SoundOption) => void;
  isMuted: boolean;
  onMutedChange: (muted: boolean) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  soundOption,
  onSoundOptionChange,
  isMuted,
  onMutedChange
}: SettingsModalProps) {
  if (!isOpen) return null;

  const soundOptions: Record<SoundOption, string> = {
    default: '默认提示音',
    bell: '钟声',
    digital: '电子音',
    gentle: '温和提示音'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">设置</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">声音设置</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={!isMuted}
                  onChange={(e) => onMutedChange(!e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-gray-700">启用声音</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">提示音选择</h3>
            <div className="space-y-2">
              {Object.entries(soundOptions).map(([value, label]) => (
                <label key={value} className="flex items-center">
                  <input
                    type="radio"
                    value={value}
                    checked={soundOption === value}
                    onChange={(e) => onSoundOptionChange(e.target.value as SoundOption)}
                    disabled={isMuted}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">关于</h3>
            <p className="text-sm text-gray-500">
              多功能计时器 v1.0.0
              <br />
              一个帮助你管理时间的简单工具
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}