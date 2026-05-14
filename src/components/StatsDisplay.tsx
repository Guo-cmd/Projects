import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Stats } from '@/types';
import { Trophy, Calendar } from 'lucide-react';
import { TaskCategory } from '@/types';


interface StatsDisplayProps {
  stats: Stats;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  const categories: TaskCategory[] = ['deep_work', 'shallow_work', 'meeting', 'learning', 'creative'];
  const catLabels: Record<TaskCategory, string> = {
    deep_work: '深度',
    shallow_work: '浅层',
    meeting: '会议',
    learning: '学习',
    creative: '创意'
  };

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-md">
      <div className="grid grid-cols-2 gap-6 w-full">
        <Card className="bg-background/40 backdrop-blur-md border border-border/40 shadow-xl shadow-black/5 rounded-3xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-black/10 group">
          <CardContent className="p-8 flex flex-col items-center justify-center space-y-3 relative">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calendar className="h-12 w-12" />
            </div>
            <Calendar className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <div className="text-4xl font-black tracking-tight">{stats.todayCompleted}</div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">今日完成</div>
          </CardContent>
        </Card>
        <Card className="bg-background/40 backdrop-blur-md border border-border/40 shadow-xl shadow-black/5 rounded-3xl overflow-hidden transition-all hover:shadow-2xl hover:shadow-black/10 group">
          <CardContent className="p-8 flex flex-col items-center justify-center space-y-3 relative">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="h-12 w-12" />
            </div>
            <Trophy className="h-6 w-6 text-secondary transition-transform group-hover:scale-110" />
            <div className="text-4xl font-black tracking-tight">{stats.totalCompleted}</div>
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">累计完成</div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full grid grid-cols-5 gap-2 px-2">
        {categories.map((cat) => {
          const catStat = stats.categoryStats?.[cat] || { pomodoros: 0, minutes: 0 };
          const maxPoms = Math.max(...categories.map(c => stats.categoryStats?.[c]?.pomodoros || 1), 1);
          const height = Math.max((catStat.pomodoros / maxPoms) * 100, 5);
          
          return (
            <div key={cat} className="flex flex-col items-center space-y-2 group">
              <div className="w-full h-16 bg-muted/30 rounded-lg flex items-end overflow-hidden relative">
                <div 
                  className="w-full bg-primary/40 group-hover:bg-primary/60 transition-all duration-500 rounded-t-sm"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[8px] font-bold text-muted-foreground whitespace-nowrap">{catLabels[cat]}</span>
              <span className="text-[10px] font-black">{catStat.pomodoros}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
