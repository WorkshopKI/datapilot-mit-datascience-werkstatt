// Business Understanding Phase - Full Implementation
import { useState } from 'react';
import { WorkspaceProject, Feature } from '@/engine/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GlossaryLink, GlossaryText } from '../GlossaryLink';
import { Plus, Trash2, Edit2, Check, X, Target, Lightbulb, Info, List, BookOpen } from 'lucide-react';

interface BusinessUnderstandingProps {
  project: WorkspaceProject;
  onUpdateProject: (updates: Partial<WorkspaceProject>) => void;
  onAddFeature: (feature: Omit<Feature, 'id'>) => void;
  onUpdateFeature: (featureId: string, updates: Partial<Feature>) => void;
  onRemoveFeature: (featureId: string) => void;
}

export function BusinessUnderstanding({
  project,
  onUpdateProject,
  onAddFeature,
  onUpdateFeature,
  onRemoveFeature,
}: BusinessUnderstandingProps) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(project.businessGoal || '');
  const [criteriaDraft, setCriteriaDraft] = useState(project.successCriteria || '');
  
  const [newFeature, setNewFeature] = useState({ name: '', type: 'numerisch' as Feature['type'], description: '' });
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);

  const handleSaveGoals = () => {
    onUpdateProject({
      businessGoal: goalDraft,
      successCriteria: criteriaDraft,
    });
    setIsEditingGoal(false);
  };

  const handleAddFeature = () => {
    if (newFeature.name.trim()) {
      onAddFeature({
        name: newFeature.name.trim(),
        type: newFeature.type,
        description: newFeature.description.trim(),
      });
      setNewFeature({ name: '', type: 'numerisch', description: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Didaktischer Einstieg */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-orange-800 mb-1">Was passiert in dieser Phase?</p>
            <p className="text-orange-700">
              Im{' '}
              <GlossaryLink term="Business Understanding">Business Understanding</GlossaryLink>{' '}
              definierst du das Geschäftsziel deines Projekts: Was soll erreicht werden?
              Welche{' '}
              <GlossaryLink term="Feature">Features</GlossaryLink>{' '}
              stehen zur Verfügung? Dies ist der erste Schritt im{' '}
              <GlossaryLink term="CRISP-DM">CRISP-DM</GlossaryLink>-Prozess.
            </p>
          </div>
        </div>
      </div>

      {/* Business Goal Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Geschäftsziel
              </CardTitle>
              <CardDescription>
                <GlossaryText text="Definiere das [Business Understanding] – was soll erreicht werden?" />
              </CardDescription>
            </div>
            {!isEditingGoal && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingGoal(true)}>
                <Edit2 className="h-4 w-4 mr-1" />
                Bearbeiten
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingGoal ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Geschäftsziel</Label>
                <Textarea
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  placeholder="Was ist das übergeordnete Geschäftsziel? z.B. 'Kundenabwanderung um 15% reduzieren'"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Erfolgskriterien</Label>
                <Textarea
                  value={criteriaDraft}
                  onChange={(e) => setCriteriaDraft(e.target.value)}
                  placeholder="Wie wird Erfolg gemessen? z.B. 'Precision > 70%, Recall > 60%'"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveGoals}>
                  <Check className="h-4 w-4 mr-1" />
                  Speichern
                </Button>
                <Button variant="outline" onClick={() => setIsEditingGoal(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {project.businessGoal ? (
                <>
                  <div>
                    <Label className="text-muted-foreground text-xs">Geschäftsziel</Label>
                    <p className="mt-1">{project.businessGoal}</p>
                  </div>
                  {project.successCriteria && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Erfolgskriterien</Label>
                      <p className="mt-1">{project.successCriteria}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p>Noch kein Geschäftsziel definiert.</p>
                  <p className="text-sm">Klicke auf "Bearbeiten" um zu starten.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            Features (Eingabevariablen)
          </CardTitle>
          <CardDescription>
            <GlossaryText text="Welche [Feature]s stehen für das [Modell] zur Verfügung?" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project.features.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead className="w-[100px]">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.features.map((feature) => (
                  <TableRow key={feature.id}>
                    <TableCell className="font-medium">
                      {feature.name}
                      {feature.isTarget && (
                        <Badge variant="secondary" className="ml-2 text-xs">Target</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{feature.type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{feature.description}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveFeature(feature.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Noch keine Features definiert.
            </p>
          )}

          {/* Add Feature Form */}
          <div className="mt-4 pt-4 border-t">
            <Label className="text-sm font-medium mb-3 block">Neues Feature hinzufügen</Label>
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Feature-Name"
                value={newFeature.name}
                onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 min-w-[150px]"
              />
              <Select
                value={newFeature.type}
                onValueChange={(value) => setNewFeature(prev => ({ ...prev, type: value as Feature['type'] }))}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="numerisch">Numerisch</SelectItem>
                  <SelectItem value="kategorial">Kategorial</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="datum">Datum</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Beschreibung (optional)"
                value={newFeature.description}
                onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                className="flex-1 min-w-[200px]"
              />
              <Button onClick={handleAddFeature} disabled={!newFeature.name.trim()}>
                <Plus className="h-4 w-4 mr-1" />
                Hinzufügen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relevant Glossary Terms (Pattern 11) */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Relevante Begriffe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            <GlossaryLink term="Business Understanding" className="text-xs" />
            <GlossaryLink term="KPI" className="text-xs" />
            <GlossaryLink term="Feature" className="text-xs" />
            <GlossaryLink term="Target Variable" termId="zielvariable" className="text-xs" />
            <GlossaryLink term="Stakeholder" className="text-xs" />
          </div>
        </CardContent>
      </Card>

      {/* Lernbereich-Link (Pattern 12) */}
      <a
        href="/lernen/grundlagen#crisp-dm"
        className="text-sm text-primary hover:underline flex items-center gap-1"
      >
        <BookOpen className="h-3.5 w-3.5" />
        Mehr zu dieser Phase im Lernbereich →
      </a>
    </div>
  );
}
