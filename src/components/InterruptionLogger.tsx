import React from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageSquare, User, Bath, Zap, Stethoscope, Pencil } from 'lucide-react';

interface InterruptionLoggerProps {
  isOpen: boolean;
  onSelectReason: (reason: string) => void;
  onClose: () => void;
}

const REASONS = [
  { id: 'colleague', label: '同事打断', icon: User, color: 'text-blue-500 bg-blue-50' },
  { id: 'restroom', label: '去洗手间', icon: Bath, color: 'text-cyan-500 bg-cyan-50' },
  { id: 'urgent', label: '突发事务', icon: Zap, color: 'text-yellow-500 bg-yellow-50' },
  { id: 'health', label: '身体不适', icon: Stethoscope, color: 'text-red-500 bg-red-50' },
  { id: 'other', label: '其他', icon: Pencil, color: 'text-gray-500 bg-gray-50' },
];

export const InterruptionLogger: React.FC<InterruptionLoggerProps> = ({ 
  isOpen, 
  onSelectReason,
  onClose
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-[2.5rem] border-none shadow-2xl backdrop-blur-xl bg-background/80 px-6 pb-10">
        <div className="mx-auto w-12 h-1.5 bg-muted rounded-full mb-6" />
        <SheetHeader className="text-center space-y-2 mb-8">
          <SheetTitle className="text-xl font-black">记录中断原因</SheetTitle>
          <SheetDescription>短暂的中断能让你之后更专注，请记录以便回顾</SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {REASONS.map((reason) => (
            <button
              key={reason.id}
              onClick={() => onSelectReason(reason.label)}
              className="flex flex-col items-center justify-center p-6 rounded-3xl bg-muted/40 hover:bg-muted/60 transition-all group hover:scale-105"
            >
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:rotate-6", reason.color)}>
                <reason.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-foreground/80">{reason.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="ghost" onClick={onClose} className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
            不记录，直接暂停
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
