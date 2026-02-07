// New Project Creation Page - Wrapper for Wizard
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/hooks/useWorkspace';
import { NewProjectWizard } from '@/components/werkstatt/NewProjectWizard';
import { useToast } from '@/hooks/use-toast';

export default function NewProjectPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createProject } = useWorkspace();

  const handleCreate = (data: Parameters<typeof createProject>[0]) => {
    const project = createProject(data);
    toast({
      title: 'Projekt erstellt',
      description: `"${project.name}" wurde erfolgreich erstellt.`,
    });
    navigate(`/werkstatt/${project.id}`);
  };

  return <NewProjectWizard onCreate={handleCreate} />;
}
