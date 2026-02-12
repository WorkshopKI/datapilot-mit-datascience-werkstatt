// Single Project Card for DS Werkstatt
import { Link } from 'react-router-dom';
import { WorkspaceProject } from '@/engine/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Play, Download, Trash2, Target, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DATASET_REGISTRY, DatasetId } from '@/data/openDataRegistry';

interface ProjectCardProps {
  project: WorkspaceProject;
  onDelete?: () => void;
  onExport?: () => void;
  isExample?: boolean;
}

const projectTypeConfig = {
  klassifikation: { label: 'Klassifikation', icon: Target, color: 'text-blue-600' },
  regression: { label: 'Regression', icon: TrendingUp, color: 'text-green-600' },
  clustering: { label: 'Clustering', icon: Users, color: 'text-purple-600' },
};

export function ProjectCard({ project, onDelete, onExport, isExample }: ProjectCardProps) {
  const typeConfig = projectTypeConfig[project.type];
  const TypeIcon = typeConfig.icon;

  const completedPhases = project.phases.filter(p => p.status === 'completed').length;
  const totalPhases = project.phases.length;
  const progressPercent = Math.round((completedPhases / totalPhases) * 100);

  const currentPhaseLabel = project.phases.find(p => p.id === project.currentPhase)?.shortName || 'Start';

  // Update frequency badge for real datasets
  const datasetInfo = project.selectedDataset
    ? DATASET_REGISTRY[project.selectedDataset as DatasetId]
    : undefined;
  const frequencyLabel = datasetInfo?.updateFrequency === 'daily'
    ? 'täglich'
    : datasetInfo?.updateFrequency === 'weekly'
      ? 'wöchentlich'
      : undefined;

  return (
    <Card className="group hover:shadow-md transition-all hover:border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeIcon className={cn('h-5 w-5', typeConfig.color)} />
            <Badge variant="outline" className="text-xs">
              {typeConfig.label}
            </Badge>
            {frequencyLabel && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <RefreshCw className="h-3 w-3 mr-1" />
                {frequencyLabel}
              </Badge>
            )}
          </div>
          
          {(onDelete || onExport) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onExport && (
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportieren
                  </DropdownMenuItem>
                )}
                {onExport && onDelete && <DropdownMenuSeparator />}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <CardTitle className="text-lg leading-tight">{project.name}</CardTitle>
        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-2">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">{currentPhaseLabel}</span>
            <span className="font-medium">{completedPhases}/{totalPhases}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Badge + Action */}
        <div className="flex items-center justify-between">
          {isExample && project.selectedDataset ? (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              Echte Daten
            </Badge>
          ) : isExample ? (
            <Badge variant="secondary" className="text-xs">
              Synth. Daten
            </Badge>
          ) : project.hasDemoData ? (
            <Badge variant="secondary" className="text-xs">
              Demo-Projekt
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">
              {project.features.length} Features
            </span>
          )}

          <Button asChild size="sm" className="gap-1">
            <Link to={`/werkstatt/${project.id}`}>
              <Play className="h-3 w-3" />
              {isExample ? 'Öffnen' : 'Fortsetzen'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
