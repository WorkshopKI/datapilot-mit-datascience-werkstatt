// Export Modal for DS Werkstatt projects
import { WorkspaceProject } from '@/engine/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileJson, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface ExportModalProps {
  project: WorkspaceProject;
  onClose: () => void;
  onExport: (project: WorkspaceProject) => void;
}

export function ExportModal({ project, onClose, onExport }: ExportModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = async () => {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      project,
    };
    
    await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Projekt exportieren</DialogTitle>
          <DialogDescription>
            Exportiere "{project.name}" als JSON-Datei.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <FileJson className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{project.name}</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• {project.phases.filter(p => p.status === 'completed').length}/{project.phases.length} Phasen abgeschlossen</p>
              <p>• {project.features.length} Features definiert</p>
              <p>• Typ: {project.type}</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Die Export-Datei enthält alle Projektdaten einschließlich der CRISP-DM-Phasen, Features und Einstellungen.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCopyJson} className="gap-2">
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Kopiert!' : 'Als JSON kopieren'}
          </Button>
          <Button onClick={() => onExport(project)} className="gap-2">
            <Download className="h-4 w-4" />
            Als Datei herunterladen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
