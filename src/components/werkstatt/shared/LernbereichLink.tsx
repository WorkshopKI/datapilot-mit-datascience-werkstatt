import { BookOpen } from 'lucide-react';

interface LernbereichLinkProps {
  anchor?: string;
}

export function LernbereichLink({ anchor = 'crisp-dm' }: LernbereichLinkProps) {
  return (
    <a
      href={`/lernen/grundlagen#${anchor}`}
      className="text-sm text-primary hover:underline flex items-center gap-1"
    >
      <BookOpen className="h-3.5 w-3.5" />
      Mehr zu dieser Phase im Lernbereich →
    </a>
  );
}
