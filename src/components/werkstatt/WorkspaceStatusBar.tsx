// Workspace Status Bar for DS Werkstatt
import { Badge } from '@/components/ui/badge';
import { HardDrive, Cloud, RefreshCw } from 'lucide-react';

interface WorkspaceStatusBarProps {
  mode: 'local' | 'sync';
  lastSaved?: string;
  isSyncing?: boolean;
}

export function WorkspaceStatusBar({ mode, lastSaved, isSyncing }: WorkspaceStatusBarProps) {
  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur border-t px-4 py-2">
      <div className="container mx-auto max-w-5xl flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {mode === 'local' ? (
            <>
              <HardDrive className="h-3.5 w-3.5" />
              <span>Lokal gespeichert</span>
            </>
          ) : (
            <>
              <Cloud className="h-3.5 w-3.5" />
              <span>Cloud-Sync</span>
            </>
          )}
          
          {isSyncing && (
            <Badge variant="secondary" className="gap-1 text-xs py-0">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Synchronisiert...
            </Badge>
          )}
        </div>

        {lastSaved && (
          <span>Zuletzt gespeichert: {new Date(lastSaved).toLocaleTimeString('de-DE')}</span>
        )}
      </div>
    </div>
  );
}
