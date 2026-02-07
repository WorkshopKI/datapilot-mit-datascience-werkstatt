// Project List for DS Werkstatt
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WorkspaceProject } from '@/engine/types';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Upload, FlaskConical } from 'lucide-react';
import { ExportModal } from './ExportModal';

interface ProjectListProps {
  projects: WorkspaceProject[];
  onDelete: (id: string) => void;
  onExport: (project: WorkspaceProject) => void;
  onImport: (file: File) => void;
}

export function ProjectList({ projects, onDelete, onExport, onImport }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [exportModalProject, setExportModalProject] = useState<WorkspaceProject | null>(null);

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImport(file);
    };
    input.click();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FlaskConical className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">DS Werkstatt</h1>
            <p className="text-muted-foreground text-sm">
              {projects.length} {projects.length === 1 ? 'Projekt' : 'Projekte'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImportClick}>
            <Upload className="h-4 w-4 mr-2" />
            Importieren
          </Button>
          <Button asChild size="sm">
            <Link to="/werkstatt/neu">
              <Plus className="h-4 w-4 mr-2" />
              Neues Projekt
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      {projects.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Projekte durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Project Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={() => onDelete(project.id)}
              onExport={() => setExportModalProject(project)}
            />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Keine Projekte gefunden für "{searchQuery}"</p>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-xl">
          <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Noch keine Projekte</h3>
          <p className="text-muted-foreground mb-4">
            Erstelle dein erstes Data Science Projekt
          </p>
          <Button asChild>
            <Link to="/werkstatt/neu">
              <Plus className="h-4 w-4 mr-2" />
              Projekt erstellen
            </Link>
          </Button>
        </div>
      )}

      {/* Export Modal */}
      {exportModalProject && (
        <ExportModal
          project={exportModalProject}
          onClose={() => setExportModalProject(null)}
          onExport={(project) => {
            onExport(project);
            setExportModalProject(null);
          }}
        />
      )}
    </div>
  );
}
