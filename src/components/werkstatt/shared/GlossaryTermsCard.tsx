import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { GlossaryLink } from '../GlossaryLink';

interface GlossaryTerm {
  term: string;
  termId?: string;
}

interface GlossaryTermsCardProps {
  terms: GlossaryTerm[];
}

export function GlossaryTermsCard({ terms }: GlossaryTermsCardProps) {
  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Relevante Begriffe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {terms.map(({ term, termId }) => (
            <GlossaryLink key={termId ?? term} term={term} termId={termId} className="text-xs" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
