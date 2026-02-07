import { CardCategory, cardCategories } from '@/data/challengeCardsData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selected: CardCategory | 'all';
  onSelect: (category: CardCategory | 'all') => void;
}

const categoryActiveStyles: Record<CardCategory, string> = {
  krisen: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:border-red-800',
  entscheidungen: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800',
  stakeholder: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800',
  daten: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-300 dark:border-emerald-800',
};

const categoryHoverStyles: Record<CardCategory, string> = {
  krisen: 'hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:hover:bg-red-950/30 dark:hover:text-red-400',
  entscheidungen: 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-400',
  stakeholder: 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 dark:hover:bg-purple-950/30 dark:hover:text-purple-400',
  daten: 'hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400',
};

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button
        variant={selected === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect('all')}
        className="text-xs md:text-sm"
      >
        Alle
      </Button>
      {cardCategories.map((category) => (
        <Button
          key={category.id}
          variant="outline"
          size="sm"
          onClick={() => onSelect(category.id)}
          className={cn(
            "text-xs md:text-sm gap-1",
            selected === category.id
              ? categoryActiveStyles[category.id]
              : categoryHoverStyles[category.id]
          )}
        >
          <span>{category.emoji}</span>
          <span className="hidden sm:inline">{category.name}</span>
        </Button>
      ))}
    </div>
  );
}
