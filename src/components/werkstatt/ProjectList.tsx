// Project List for DS Werkstatt
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WorkspaceProject } from '@/engine/types';
import { ProjectCard } from './ProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Upload, FlaskConical, BookOpen } from 'lucide-react';
import { ExportModal } from './ExportModal';

interface ProjectListProps {
  projects: WorkspaceProject[];
  exampleProjects?: WorkspaceProject[];
  onDelete: (id: string) => void;
  onExport: (project: WorkspaceProject) => void;
  onImport: (file: File) => void;
}

export function ProjectList({ projects, exampleProjects = [], onDelete, onExport, onImport }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [exportModalProject, setExportModalProject] = useState<WorkspaceProject | null>(null);

  const query = searchQuery.toLowerCase();

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );

  const filteredExamples = exampleProjects.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );

  const totalProjects = projects.length + exampleProjects.length;
  const showSearch = totalProjects > 0;
  const hasSearchResults = filteredProjects.length > 0 || filteredExamples.length > 0;

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
              {projects.length} {projects.length === 1 ? 'eigenes Projekt' : 'eigene Projekte'}
              {exampleProjects.length > 0 && ` · ${exampleProjects.length} Beispiele`}
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
      {showSearch && (
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

      {/* No search results */}
      {searchQuery && !hasSearchResults && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Keine Projekte gefunden für "{searchQuery}"</p>
        </div>
      )}

      {/* Meine Projekte Section */}
      {(!searchQuery || filteredProjects.length > 0) && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Meine Projekte ({projects.length})
          </h2>

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
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <FlaskConical className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Noch keine eigenen Projekte</h3>
              <p className="text-muted-foreground mb-4">
                Erstelle dein erstes Data Science Projekt oder starte mit einem Beispiel
              </p>
              <Button asChild>
                <Link to="/werkstatt/neu">
                  <Plus className="h-4 w-4 mr-2" />
                  Projekt erstellen
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Beispielprojekte Section */}
      {exampleProjects.length > 0 && (!searchQuery || filteredExamples.length > 0) && (() => {
        const realExamples = filteredExamples.filter(p => !!p.selectedDataset);
        const synthExamples = filteredExamples.filter(p => !p.selectedDataset);

        return (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Beispielprojekte ({exampleProjects.length})
            </h2>

            {/* Echte Daten */}
            {realExamples.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-3">
                  Echte Daten ({realExamples.length})
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {realExamples.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isExample
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Synthetische Szenarien */}
            {synthExamples.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-3">
                  Synthetische Szenarien ({synthExamples.length})
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {synthExamples.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isExample
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

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
