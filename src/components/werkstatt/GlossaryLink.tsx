// GlossaryLink - Links terms to the glossary
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GlossaryLinkProps {
  term: string;
  termId?: string;
  className?: string;
  children?: React.ReactNode;
}

export function GlossaryLink({ term, termId, className, children }: GlossaryLinkProps) {
  // Generate term ID from term name if not provided
  const id = termId || term.toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return (
    <Link
      to={`/nachschlagen/begriffe?term=${encodeURIComponent(id)}`}
      className={cn(
        'text-primary hover:text-primary/80 underline decoration-dotted underline-offset-2 transition-colors',
        className
      )}
    >
      {children || term}
    </Link>
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
