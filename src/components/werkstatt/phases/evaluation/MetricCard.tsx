import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  highlight?: boolean;
  wide?: boolean;
}

export function MetricCard({ label, value, description, highlight, wide }: MetricCardProps) {
  return (
    <Card className={`${highlight ? 'border-orange-200 bg-orange-50/50' : ''} ${wide ? 'sm:col-span-3' : ''}`}>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className={`text-2xl font-bold ${highlight ? 'text-orange-600' : 'text-gray-900'}`}>
          {value}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      </CardContent>
    </Card>
  );
}
