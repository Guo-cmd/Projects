import { TimerTemplate } from './types.ts';

export const TIMER_TEMPLATES: TimerTemplate[] = [
  {
    name: '番茄工作法',
    duration: 25,
    category: 'work'
  },
  {
    name: '短休息',
    duration: 5,
    category: 'work'
  },
  {
    name: '长休息',
    duration: 15,
    category: 'work'
  },
  {
    name: '专注学习',
    duration: 45,
    category: 'study'
  },
  {
    name: '冥想',
    duration: 10,
    category: 'meditation'
  },
  {
    name: '运动',
    duration: 30,
    category: 'exercise'
  }
];

export const SOUND_URLS = {
  default: 'https://assets.mixkit.co/active_storage/sfx/2404/2404-preview.mp3',
  bell: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  digital: 'https://assets.mixkit.co/active_storage/sfx/1795/1795-preview.mp3',
  gentle: 'https://assets.mixkit.co/active_storage/sfx/2471/2471-preview.mp3'
};