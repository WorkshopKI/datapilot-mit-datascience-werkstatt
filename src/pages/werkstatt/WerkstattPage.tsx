// DS Werkstatt Main Page
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/hooks/useWorkspace';
import { OnboardingScreen } from '@/components/werkstatt/OnboardingScreen';
import { ProjectList } from '@/components/werkstatt/ProjectList';
import { WorkspaceStatusBar } from '@/components/werkstatt/WorkspaceStatusBar';
import { useToast } from '@/hooks/use-toast';

export default function WerkstattPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    onboardingDone,
    mode,
    projects,
    completeOnboarding,
    deleteProject,
    exportProject,
    importProject,
  } = useWorkspace();

  const handleDelete = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project && window.confirm(`Projekt "${project.name}" wirklich löschen?`)) {
      deleteProject(id);
      toast({
        title: 'Projekt gelöscht',
        description: `"${project.name}" wurde entfernt.`,
      });
    }
  };

  const handleImport = async (file: File) => {
    try {
      const imported = await importProject(file);
      toast({
        title: 'Projekt importiert',
        description: `"${imported.name}" wurde erfolgreich importiert.`,
      });
    } catch (error) {
      toast({
        title: 'Import fehlgeschlagen',
        description: 'Die Datei konnte nicht importiert werden.',
        variant: 'destructive',
      });
    }
  };

  // Show onboarding if not done
  if (!onboardingDone) {
    return (
      <OnboardingScreen
        onComplete={(selectedMode) => {
          completeOnboarding(selectedMode);
          toast({
            title: 'Willkommen in der DS Werkstatt!',
            description: 'Ein Demo-Projekt wurde für dich erstellt.',
          });
        }}
      />
    );
  }

  return (
    <>
      <ProjectList
        projects={projects}
        onDelete={handleDelete}
        onExport={exportProject}
        onImport={handleImport}
      />
      <WorkspaceStatusBar mode={mode} />
    </>
  );
}
