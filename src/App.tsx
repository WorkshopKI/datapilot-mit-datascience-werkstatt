import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lernen
import LernenIndex from "./pages/lernen/LernenIndex";
import Grundlagen from "./pages/lernen/Grundlagen";
import Quiz from "./pages/lernen/Quiz";
import ChallengeCards from "./pages/lernen/ChallengeCards";

// KI-Assistenten
import KIAssistentenIndex from "./pages/ki-assistenten/KIAssistentenIndex";
import TutorStartrampe from "./pages/ki-assistenten/tutor/TutorStartrampe";
import TutorUebersicht from "./pages/lernen/tutor/TutorUebersicht";
import TutorBeispiel from "./pages/lernen/tutor/TutorBeispiel";
import TutorPhasen from "./pages/lernen/tutor/TutorPhasen";
import TutorBefehle from "./pages/lernen/tutor/TutorBefehle";
import TutorStarten from "./pages/lernen/tutor/TutorStarten";
import TutorModus from "./pages/lernen/tutor/TutorModus";
import CopilotStartrampe from "./pages/ki-assistenten/copilot/CopilotStartrampe";
import CopilotFaehigkeiten from "./pages/analysieren/copilot/CopilotFaehigkeiten";
import CopilotPhasen from "./pages/analysieren/copilot/CopilotPhasen";
import CopilotBefehle from "./pages/analysieren/copilot/CopilotBefehle";
import CopilotBeispiel from "./pages/analysieren/copilot/CopilotBeispiel";

// Planen
import PlanenIndex from "./pages/planen/PlanenIndex";
import ProjektPlanen from "./pages/planen/ProjektPlanen";
import ChecklisteGenerieren from "./pages/planen/ChecklisteGenerieren";

// Im Projekt
import ImProjektIndex from "./pages/im-projekt/ImProjektIndex";
import MeetingVorbereiten from "./pages/im-projekt/MeetingVorbereiten";
import StakeholderBefragen from "./pages/im-projekt/StakeholderBefragen";
import ROIBerechnen from "./pages/im-projekt/ROIBerechnen";

// Nachschlagen
import NachschlagenIndex from "./pages/nachschlagen/NachschlagenIndex";
import BegriffeUebersetzungen from "./pages/nachschlagen/BegriffeUebersetzungen";
import MetrikenReferenz from "./pages/nachschlagen/MetrikenReferenz";
import ProblemDiagnose from "./pages/nachschlagen/ProblemDiagnose";

// DS Werkstatt
import WerkstattPage from "./pages/werkstatt/WerkstattPage";
import ProjectPage from "./pages/werkstatt/ProjectPage";
import NewProjectPage from "./pages/werkstatt/NewProjectPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Start */}
            <Route path="/" element={<Index />} />

            {/* Lernen */}
            <Route path="/lernen" element={<LernenIndex />} />
            <Route path="/lernen/grundlagen" element={<Grundlagen />} />
            <Route path="/lernen/challenge-cards" element={<ChallengeCards />} />
            <Route path="/lernen/quiz" element={<Quiz />} />

            {/* KI-Assistenten */}
            <Route path="/ki-assistenten" element={<KIAssistentenIndex />} />
            <Route path="/ki-assistenten/tutor" element={<TutorStartrampe />} />
            <Route path="/ki-assistenten/tutor/uebersicht" element={<TutorUebersicht />} />
            <Route path="/ki-assistenten/tutor/beispiel" element={<TutorBeispiel />} />
            <Route path="/ki-assistenten/tutor/phasen" element={<TutorPhasen />} />
            <Route path="/ki-assistenten/tutor/befehle" element={<TutorBefehle />} />
            <Route path="/ki-assistenten/tutor/starten" element={<TutorStarten />} />
            <Route path="/ki-assistenten/tutor/modus" element={<TutorModus />} />
            <Route path="/ki-assistenten/copilot" element={<CopilotStartrampe />} />
            <Route path="/ki-assistenten/copilot/faehigkeiten" element={<CopilotFaehigkeiten />} />
            <Route path="/ki-assistenten/copilot/phasen" element={<CopilotPhasen />} />
            <Route path="/ki-assistenten/copilot/befehle" element={<CopilotBefehle />} />
            <Route path="/ki-assistenten/copilot/beispiel" element={<CopilotBeispiel />} />

            {/* Planen */}
            <Route path="/planen" element={<PlanenIndex />} />
            <Route path="/planen/projekt" element={<ProjektPlanen />} />
            <Route path="/planen/checkliste" element={<ChecklisteGenerieren />} />

            {/* Im Projekt */}
            <Route path="/im-projekt" element={<ImProjektIndex />} />
            <Route path="/im-projekt/meeting" element={<MeetingVorbereiten />} />
            <Route path="/im-projekt/stakeholder" element={<StakeholderBefragen />} />
            <Route path="/im-projekt/roi" element={<ROIBerechnen />} />

            {/* Nachschlagen */}
            <Route path="/nachschlagen" element={<NachschlagenIndex />} />
            <Route path="/nachschlagen/begriffe" element={<BegriffeUebersetzungen />} />
            <Route path="/nachschlagen/metriken" element={<MetrikenReferenz />} />
            <Route path="/nachschlagen/diagnose" element={<ProblemDiagnose />} />

            {/* DS Werkstatt */}
            <Route path="/werkstatt" element={<WerkstattPage />} />
            <Route path="/werkstatt/neu" element={<NewProjectPage />} />
            <Route path="/werkstatt/:projectId" element={<ProjectPage />} />
            
            {/* Redirects für Nachschlagen */}
            <Route path="/nachschlagen/glossar" element={<Navigate to="/nachschlagen/begriffe?modus=schnell" replace />} />
            <Route path="/nachschlagen/uebersetzen" element={<Navigate to="/nachschlagen/begriffe?modus=stakeholder" replace />} />

            {/* Redirects für alte URLs - Tutor */}
            <Route path="/lernen/tutor" element={<Navigate to="/ki-assistenten/tutor" replace />} />
            <Route path="/lernen/tutor/*" element={<Navigate to="/ki-assistenten/tutor" replace />} />
            
            {/* Redirects für alte URLs - Copilot/Analysieren */}
            <Route path="/analysieren" element={<Navigate to="/ki-assistenten/copilot" replace />} />
            <Route path="/analysieren/copilot" element={<Navigate to="/ki-assistenten/copilot" replace />} />
            <Route path="/analysieren/copilot/*" element={<Navigate to="/ki-assistenten/copilot" replace />} />

            {/* Redirects für alte URLs */}
            <Route path="/grundlagen" element={<Navigate to="/lernen/grundlagen" replace />} />
            <Route path="/tutor" element={<Navigate to="/ki-assistenten/tutor" replace />} />
            <Route path="/tutor/*" element={<Navigate to="/ki-assistenten/tutor" replace />} />
            <Route path="/quiz" element={<Navigate to="/lernen/quiz" replace />} />
            <Route path="/canvas" element={<Navigate to="/planen/projekt" replace />} />
            <Route path="/werkzeuge" element={<Navigate to="/planen" replace />} />
            <Route path="/werkzeuge/canvas" element={<Navigate to="/planen/projekt" replace />} />
            <Route path="/werkzeuge/starter" element={<Navigate to="/planen/checkliste" replace />} />
            <Route path="/werkzeuge/meeting" element={<Navigate to="/im-projekt/meeting" replace />} />
            <Route path="/werkzeuge/interview" element={<Navigate to="/im-projekt/stakeholder" replace />} />
            <Route path="/werkzeuge/roi" element={<Navigate to="/im-projekt/roi" replace />} />
            <Route path="/werkzeuge/translator" element={<Navigate to="/nachschlagen/uebersetzen" replace />} />
            <Route path="/referenz" element={<Navigate to="/nachschlagen" replace />} />
            <Route path="/referenz/glossar" element={<Navigate to="/nachschlagen/glossar" replace />} />
            <Route path="/referenz/crisp-dm" element={<Navigate to="/nachschlagen/glossar" replace />} />
            <Route path="/referenz/rollen" element={<Navigate to="/nachschlagen/glossar" replace />} />
            <Route path="/theorie/*" element={<Navigate to="/lernen/grundlagen" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
