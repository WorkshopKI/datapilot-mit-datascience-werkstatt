// Zentraler Export aller Content-Module
// Ermöglicht Import wie bisher: import { dataScience, rollen, ... } from "@/data/content"

export { dataScience, crispDmPhasen } from "./dataScience";
export { rollen } from "./rollen";
export { widerstaende } from "./changeManagement";
export { projektmanagement } from "./projektmanagement";
export { rollenQuizFragen, quizRollen, rollenQuizSzenarien } from "./quizData";
export { 
  chatbotUrls, 
  tutorInfo, 
  beispielDialog, 
  beispielProjektbrief, 
  tutorPhasen, 
  tutorBefehle, 
  modusTipps,
  challengeRollen 
} from "./tutor";
export { trackedSections } from "./progress";

// Copilot exports
export {
  copilotChatbotUrls,
  copilotInfo,
  copilotStartWege,
  copilotPhasen,
  copilotBefehle,
  beispielDialogCopilot,
  copilotVsTutor,
  copilotModusTipps
} from "../copilotData";
export { copilotPrompt } from "../copilotPrompt";
