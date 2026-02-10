import { cn } from '@/lib/utils';
import { GlossaryLink } from '../../GlossaryLink';

interface MethodCardProps<T extends string> {
  value: T;
  selected: boolean;
  label: string;
  description: string;
  glossaryTerm?: string;
  glossaryTermId?: string;
  disabled?: boolean;
  onSelect: (value: T) => void;
}

export function MethodCard<T extends string>({
  value,
  selected,
  label,
  description,
  glossaryTerm,
  glossaryTermId,
  disabled,
  onSelect,
}: MethodCardProps<T>) {
  return (
    <div
      className={cn(
        'rounded-xl border p-3 transition-all',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer',
        selected
          ? 'border-orange-500 bg-orange-50'
          : disabled ? '' : 'hover:border-orange-200 hover:shadow-sm'
      )}
      onClick={() => !disabled && onSelect(value)}
    >
      <div className="flex items-start gap-2.5">
        <div className={cn(
          'mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center',
          selected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
        )}>
          {selected && (
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
          {glossaryTerm && (
            <div className="mt-1.5">
              <GlossaryLink term={glossaryTerm} termId={glossaryTermId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
