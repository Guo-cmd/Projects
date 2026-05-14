import React from 'react';
import { Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { TimerSettings } from '@/types';

interface SettingsPanelProps {
  settings: TimerSettings;
  onSave: (settings: TimerSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState<TimerSettings>(settings);
  const [open, setOpen] = React.useState(false);

  // Sync local settings with props when settings change or dialog opens
  React.useEffect(() => {
    if (open) {
      setLocalSettings(settings);
    }
  }, [settings, open]);

  const handleChange = (key: keyof TimerSettings, value: string) => {
    const numValue = parseInt(value) || 0;
    setLocalSettings(prev => ({ ...prev, [key]: numValue }));
  };

  const handleSave = () => {
    if (localSettings.workDuration < 1 || localSettings.workDuration > 120 ||
        localSettings.breakDuration < 1 || localSettings.breakDuration > 120 ||
        localSettings.longBreakDuration < 1 || localSettings.longBreakDuration > 120 ||
        localSettings.dailyGoal < 1 || localSettings.dailyGoal > 50) {
      alert('时长需在 1 到 120 分钟之间，每日目标需在 1 到 50 之间');
      return;
    }
    onSave(localSettings);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
          <div className="grid gap-2">
            <Label htmlFor="dailyGoal">每日目标 (番茄数)</Label>
            <Input
              id="dailyGoal"
              type="number"
              value={localSettings.dailyGoal}
              onChange={(e) => handleChange('dailyGoal', e.target.value)}
              min={1}
              max={50}
            />
          </div>

        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="work">番茄钟时长 (分钟)</Label>
            <Input
              id="work"
              type="number"
              value={localSettings.workDuration}
              onChange={(e) => handleChange('workDuration', e.target.value)}
              min={1}
              max={120}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="break">短休息时长 (分钟)</Label>
            <Input
              id="break"
              type="number"
              value={localSettings.breakDuration}
              onChange={(e) => handleChange('breakDuration', e.target.value)}
              min={1}
              max={120}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="longBreak">长假时长 (分钟)</Label>
            <Input
              id="longBreak"
              type="number"
              value={localSettings.longBreakDuration}
              onChange={(e) => handleChange('longBreakDuration', e.target.value)}
              min={1}
              max={120}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} className="w-full">保存设置</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
