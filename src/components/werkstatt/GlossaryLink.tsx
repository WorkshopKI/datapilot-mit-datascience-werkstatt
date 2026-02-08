// GlossaryLink - Inline popover with term definition, fallback to glossary navigation
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink } from 'lucide-react';
import { getTermById, termCategories } from '@/data/termsData';

interface GlossaryLinkProps {
  term: string;
  termId?: string;
  className?: string;
  children?: React.ReactNode;
}

function generateSlug(term: string): string {
  return term.toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function GlossaryLink({ term, termId, className, children }: GlossaryLinkProps) {
  const id = termId || generateSlug(term);
  const termData = getTermById(id);

  // Fallback: term not found in data → render as plain text
  if (!termData) {
    return <span className={className}>{children || term}</span>;
  }

  const category = termCategories.find(c => c.id === termData.category);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline p-0 m-0 border-0 bg-transparent font-inherit text-left cursor-pointer',
            'text-primary hover:text-primary/80 underline decoration-dotted underline-offset-2 transition-colors',
            className
          )}
        >
          {children || term}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-3">
          {/* Category badge */}
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category.icon} {category.name}
            </Badge>
          )}

          {/* Term name */}
          <p className="font-semibold text-sm text-foreground">{termData.name}</p>

          {/* Short definition */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {termData.shortDefinition}
          </p>

          {/* Quick example */}
          {termData.quickExample && (
            <div className="bg-muted rounded-md px-3 py-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium">Beispiel:</span> {termData.quickExample}
              </p>
            </div>
          )}
        </div>

        {/* Footer: link to full glossary */}
        <div className="border-t px-4 py-2.5">
          <Link
            to={`/nachschlagen/begriffe?term=${encodeURIComponent(id)}`}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <BookOpen className="h-3 w-3" />
            Zum Glossar
            <ExternalLink className="h-3 w-3 ml-auto" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper component to render text with embedded glossary links
interface GlossaryTextProps {
  text: string; // Text with [term] markers
  className?: string;
}

export function GlossaryText({ text, className }: GlossaryTextProps) {
  // Parse text and replace [term] with GlossaryLink
  const parts = text.split(/\[([^\]]+)\]/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Odd indices are the captured groups (terms)
        if (index % 2 === 1) {
          return <GlossaryLink key={index} term={part} />;
        }
        return part;
      })}
    </span>
  );
}
