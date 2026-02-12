// New Project Wizard for DS Werkstatt
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Target, TrendingUp, Users, CheckCircle2, FlaskConical } from 'lucide-react';
import { ProjectType, Feature } from '@/engine/types';
import { DATASET_REGISTRY, type DatasetId } from '@/data/openDataRegistry';
import { cn } from '@/lib/utils';
import { DataImportZone } from './DataImportZone';
import { DatasetSelector } from './DatasetSelector';
import { GlossaryLink } from './GlossaryLink';

interface NewProjectWizardProps {
  onCreate: (data: {
    name: string;
    description: string;
    type: ProjectType;
    currentPhase: 'business-understanding';
    features: Feature[];
    selectedDataset?: string;
  }) => void;
}

const projectTypes = [
  {
    id: 'klassifikation' as ProjectType,
    label: 'Klassifikation',
    icon: Target,
    description: 'Kategorien vorhersagen (z.B. Spam/Nicht-Spam, Churn/Kein Churn)',
    examples: ['Kundenabwanderung', 'Spam-Erkennung', 'Kreditwürdigkeit'],
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'regression' as ProjectType,
    label: 'Regression',
    icon: TrendingUp,
    description: 'Zahlenwerte vorhersagen (z.B. Preise, Umsatz)',
    examples: ['Immobilienpreise', 'Umsatzprognose', 'Nachfrageplanung'],
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  {
    id: 'clustering' as ProjectType,
    label: 'Clustering',
    icon: Users,
    description: 'Ähnliche Datenpunkte gruppieren (z.B. Kundensegmente)',
    examples: ['Kundensegmentierung', 'Anomalie-Erkennung', 'Dokumenten-Clustering'],
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
];

/** Map registry feature types to project Feature types */
function mapFeatureType(regType: 'numerical' | 'categorical' | 'datetime' | 'text'): 'numerisch' | 'kategorial' | 'text' | 'datum' {
  switch (regType) {
    case 'numerical': return 'numerisch';
    case 'categorical': return 'kategorial';
    case 'datetime': return 'datum';
    case 'text': return 'text';
  }
}

export function NewProjectWizard({ onCreate }: NewProjectWizardProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: null as ProjectType | null,
  });
  const [selectedDataset, setSelectedDataset] = useState<DatasetId | null>(null);
  const [useOwnData, setUseOwnData] = useState(false);

  const canProceedStep1 = formData.type !== null;
  const canProceedStep2 = selectedDataset !== null || useOwnData;
  const canProceedStep3 = formData.name.trim().length >= 3;

  const handleDatasetSelect = (datasetId: DatasetId) => {
    setSelectedDataset(datasetId);
    setUseOwnData(false);
    const info = DATASET_REGISTRY[datasetId];
    if (info) {
      setFormData(prev => ({
        ...prev,
        name: info.name,
        description: info.businessQuestion,
      }));
    }
  };

  const handleUploadOwn = () => {
    setSelectedDataset(null);
    setUseOwnData(true);
    setStep(3);
  };

  const handleCreate = () => {
    if (!formData.type) return;

    let features: Feature[] = [];
    if (selectedDataset) {
      const info = DATASET_REGISTRY[selectedDataset];
      features = info.featureDefinitions.map((fd, i) => ({
        id: `f${i + 1}`,
        name: fd.name,
        type: mapFeatureType(fd.type),
        description: fd.description,
        isTarget: fd.isTarget,
      }));
    }

    onCreate({
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.type,
      currentPhase: 'business-understanding',
      features,
      selectedDataset: selectedDataset ?? undefined,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/werkstatt')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Neues Projekt erstellen</h1>
            <p className="text-sm text-muted-foreground">Schritt {step} von 3</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
          step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}>
          {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : <span>1</span>}
          <span>Projekttyp</span>
        </div>
        <div className="h-px w-8 bg-border" />
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
          step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}>
          {step > 2 ? <CheckCircle2 className="h-4 w-4" /> : <span>2</span>}
          <span>Datensatz</span>
        </div>
        <div className="h-px w-8 bg-border" />
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
          step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}>
          <span>3</span>
          <span>Details</span>
        </div>
      </div>

      {/* Step 1: Project Type */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold">Welche Art von Projekt möchtest du starten?</h2>
            <p className="text-muted-foreground">
              Nicht sicher? Schau dir die <GlossaryLink term="Supervised Learning">Supervised Learning</GlossaryLink>-Begriffe an.
            </p>
          </div>

          <div className="grid gap-4">
            {projectTypes.map((type) => (
              <Card
                key={type.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  formData.type === type.id && 'ring-2 ring-primary'
                )}
                onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={cn('p-2 rounded-lg border', type.color.split(' ').slice(1).join(' '))}>
                      <type.icon className={cn('h-5 w-5', type.color.split(' ')[0])} />
                    </div>
                    {formData.type === type.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{type.label}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {type.examples.map((example) => (
                      <Badge key={example} variant="secondary" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button disabled={!canProceedStep1} onClick={() => setStep(2)} className="gap-2">
              Weiter
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Dataset Selection */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Datensatz wählen</CardTitle>
              <CardDescription>
                Wähle einen Beispiel-Datensatz oder lade eigene Daten hoch.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DatasetSelector
                projectType={formData.type!}
                onSelect={handleDatasetSelect}
                onUploadOwn={handleUploadOwn}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => { setStep(1); setSelectedDataset(null); setUseOwnData(false); }} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Button>
            <Button disabled={!canProceedStep2} onClick={() => setStep(3)} className="gap-2">
              Weiter
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Project Details */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projektdetails</CardTitle>
              <CardDescription>
                Gib deinem Projekt einen Namen und eine kurze Beschreibung.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Projektname *</Label>
                <Input
                  id="name"
                  placeholder="z.B. Kundenabwanderung vorhersagen"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Mindestens 3 Zeichen</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Was möchtest du mit diesem Projekt erreichen?"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {useOwnData && (
            <Card>
              <CardHeader>
                <CardTitle>Daten importieren (optional)</CardTitle>
                <CardDescription>
                  Du kannst jetzt Daten hochladen oder später in der Data Understanding Phase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataImportZone onImport={(file) => console.log('Import:', file.name)} />
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Button>
            <Button disabled={!canProceedStep3} onClick={handleCreate} className="gap-2">
              Projekt erstellen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
