import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Task, TaskCategory } from '@/types';
import { cn } from '@/lib/utils';
import { Plus, Clock, Briefcase, Book, Coffee, Palette, Target } from 'lucide-react';

interface TaskBinderProps {
  isOpen: boolean;
  onClose: () => void;
  recentTasks: Task[];
  onSelectTask: (task: Task) => void;
  onCreateAndSelect: (name: string, category: TaskCategory) => void;
}

const CATEGORIES: { value: TaskCategory; label: string; icon: any; color: string }[] = [
  { value: 'deep_work', label: '深度工作', icon: Target, color: 'text-red-500 bg-red-50' },
  { value: 'shallow_work', label: '浅层工作', icon: Briefcase, color: 'text-blue-500 bg-blue-50' },
  { value: 'meeting', label: '会议', icon: Coffee, color: 'text-orange-500 bg-orange-50' },
  { value: 'learning', label: '学习', icon: Book, color: 'text-green-500 bg-green-50' },
  { value: 'creative', label: '创意', icon: Palette, color: 'text-purple-500 bg-purple-50' },
];

export const TaskBinder: React.FC<TaskBinderProps> = ({ 
  isOpen, 
  onClose, 
  recentTasks, 
  onSelectTask, 
  onCreateAndSelect 
}) => {
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('deep_work');

  const handleCreate = () => {
    if (newTaskName.trim()) {
      onCreateAndSelect(newTaskName.trim(), selectedCategory);
      setNewTaskName('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg p-0 overflow-hidden rounded-3xl border-none shadow-2xl backdrop-blur-xl bg-background/80">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-black">开启专注之旅</DialogTitle>
          <DialogDescription>在开始番茄钟之前，请选择或创建一个任务</DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* New Task Form */}
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">新建任务</Label>
            <div className="flex space-x-2">
              <Input 
                placeholder="你想完成什么？" 
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                className="h-12 bg-muted/50 border-none rounded-xl px-4 focus-visible:ring-primary/20"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <Button size="icon" className="h-12 w-12 rounded-xl shrink-0" onClick={handleCreate} disabled={!newTaskName.trim()}>
                <Plus className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl border transition-all space-y-1",
                    selectedCategory === cat.value 
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                      : "border-transparent bg-muted/30 hover:bg-muted/50"
                  )}
                >
                  <cat.icon className={cn("h-4 w-4", cat.color, "bg-transparent p-0 rounded-none")} />
                  <span className="text-[10px] font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Tasks */}
          {recentTasks.length > 0 && (
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">最近任务</Label>
              <div className="space-y-2">
                {recentTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center shadow-sm">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">{task.name}</div>
                        <div className="text-[10px] text-muted-foreground capitalize">{task.category.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">一键开始</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
