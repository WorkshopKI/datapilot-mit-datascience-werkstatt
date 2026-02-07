// Data Import Zone - Drag & Drop for CSV/Excel files
import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DataImportZoneProps {
  onImport: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export function DataImportZone({ 
  onImport, 
  accept = '.csv,.xlsx,.xls',
  maxSize = 10 
}: DataImportZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    setError(null);
    
    const validExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      setError(`Ungültiges Format. Erlaubt: ${accept}`);
      return false;
    }

    if (file.size > maxSize * 1024 * 1024) {
      setError(`Datei zu groß. Maximum: ${maxSize} MB`);
      return false;
    }

    return true;
  }, [accept, maxSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  }, [validateFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  }, [validateFile]);

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
            error && 'border-destructive'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Upload className={cn(
            'h-10 w-10 mx-auto mb-3',
            isDragging ? 'text-primary' : 'text-muted-foreground'
          )} />
          
          <p className="font-medium mb-1">
            {isDragging ? 'Datei hier ablegen' : 'CSV oder Excel-Datei hierher ziehen'}
          </p>
          <p className="text-sm text-muted-foreground">
            oder klicken zum Auswählen
          </p>
        </div>
      ) : (
        <div className="border rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleRemove}>
              <X className="h-4 w-4" />
            </Button>
            <Button onClick={handleImport}>
              Importieren
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
