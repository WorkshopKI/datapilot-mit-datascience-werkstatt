import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconBoxProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
};

const iconSizes = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-7 h-7',
};

export function IconBox({ icon: Icon, size = 'md', className }: IconBoxProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl',
        'bg-primary/10 dark:bg-primary/20',
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn('text-primary', iconSizes[size])} strokeWidth={1.5} />
    </div>
  );
}
