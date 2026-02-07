// LocalStorage-based Workspace Storage (Mock Implementation)
import { WorkspaceState, WorkspaceProject, DEFAULT_CRISP_DM_PHASES, CrispDmPhaseId } from '../types';

const STORAGE_KEYS = {
  onboardingDone: 'ds-werkstatt-onboarding-done',
  mode: 'ds-werkstatt-mode',
  projects: 'ds-werkstatt-projects',
};

// Demo project for first-time users
const createDemoProject = (): WorkspaceProject => ({
  id: 'demo-churn-prediction',
  name: 'Kundenabwanderung vorhersagen',
  description: 'Klassifikationsmodell zur Vorhersage von Kundenabwanderung (Churn)',
  type: 'klassifikation',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentPhase: 'data-preparation',
  phases: DEFAULT_CRISP_DM_PHASES.map((phase, idx) => ({
    ...phase,
    status: idx < 2 ? 'completed' : idx === 2 ? 'in-progress' : 'pending',
    completedAt: idx < 2 ? new Date().toISOString() : undefined,
  })),
  features: [
    { id: 'f1', name: 'Kunde_ID', type: 'text', description: 'Eindeutige Kundenkennung' },
    { id: 'f2', name: 'Alter', type: 'numerisch', description: 'Alter des Kunden in Jahren' },
    { id: 'f3', name: 'Vertragslaufzeit_Monate', type: 'numerisch', description: 'Vertragsdauer in Monaten' },
    { id: 'f4', name: 'Monatliche_Kosten', type: 'numerisch', description: 'Monatliche Gebühren in EUR' },
    { id: 'f5', name: 'Support_Tickets', type: 'numerisch', description: 'Anzahl Support-Anfragen' },
    { id: 'f6', name: 'Churn', type: 'kategorial', description: 'Hat der Kunde gekündigt?', isTarget: true },
  ],
  businessGoal: 'Kunden identifizieren, die wahrscheinlich kündigen werden, um rechtzeitig Retentionsmaßnahmen einzuleiten.',
  successCriteria: 'Precision > 70%, Recall > 60% für die Klasse "Churn = Ja"',
  hasDemoData: true,
});

export class WorkspaceStorage {
  static getOnboardingDone(): boolean {
    return localStorage.getItem(STORAGE_KEYS.onboardingDone) === 'true';
  }

  static setOnboardingDone(done: boolean): void {
    localStorage.setItem(STORAGE_KEYS.onboardingDone, String(done));
  }

  static getMode(): 'local' | 'sync' {
    const mode = localStorage.getItem(STORAGE_KEYS.mode);
    return mode === 'sync' ? 'sync' : 'local';
  }

  static setMode(mode: 'local' | 'sync'): void {
    localStorage.setItem(STORAGE_KEYS.mode, mode);
  }

  static getProjects(): WorkspaceProject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.projects);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static setProjects(projects: WorkspaceProject[]): void {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
  }

  static getProject(id: string): WorkspaceProject | undefined {
    return this.getProjects().find(p => p.id === id);
  }

  static createProject(project: Omit<WorkspaceProject, 'id' | 'createdAt' | 'updatedAt' | 'phases'>): WorkspaceProject {
    const newProject: WorkspaceProject = {
      ...project,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phases: DEFAULT_CRISP_DM_PHASES.map(p => ({ ...p })),
    };
    const projects = this.getProjects();
    projects.push(newProject);
    this.setProjects(projects);
    return newProject;
  }

  static updateProject(id: string, updates: Partial<WorkspaceProject>): WorkspaceProject | undefined {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setProjects(projects);
    return projects[index];
  }

  static deleteProject(id: string): boolean {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    if (filtered.length === projects.length) return false;
    this.setProjects(filtered);
    return true;
  }

  static updatePhaseStatus(projectId: string, phaseId: CrispDmPhaseId, status: 'pending' | 'in-progress' | 'completed'): void {
    const project = this.getProject(projectId);
    if (!project) return;

    const phases = project.phases.map(p => {
      if (p.id === phaseId) {
        return {
          ...p,
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : undefined,
        };
      }
      return p;
    });

    this.updateProject(projectId, { phases });
  }

  static initializeWithDemo(): void {
    const projects = this.getProjects();
    if (projects.length === 0) {
      this.setProjects([createDemoProject()]);
    }
  }

  static getState(): WorkspaceState {
    return {
      onboardingDone: this.getOnboardingDone(),
      mode: this.getMode(),
      projects: this.getProjects(),
    };
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEYS.onboardingDone);
    localStorage.removeItem(STORAGE_KEYS.mode);
    localStorage.removeItem(STORAGE_KEYS.projects);
  }
}
