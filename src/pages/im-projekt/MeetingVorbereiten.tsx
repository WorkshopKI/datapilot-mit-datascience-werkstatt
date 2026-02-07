import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { meetingTypes, getMeetingType } from "@/data/meetingPrepData";
import { MeetingTypeCard } from "@/components/werkzeuge/MeetingTypeCard";
import { MeetingDetail } from "@/components/werkzeuge/MeetingDetail";
import { ExportButtons } from "@/components/werkzeuge/ExportButtons";
import { exportElementToPdf } from "@/lib/pdfExport";
import { exportMeetingToWord } from "@/lib/wordExport";

export default function MeetingPrep() {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const selectedMeeting = selectedMeetingId ? getMeetingType(selectedMeetingId) : null;

  const handleBack = () => {
    setSelectedMeetingId(null);
  };

  const generateClipboardContent = (): string => {
    if (!selectedMeeting) return "";

    let text = `# ${selectedMeeting.emoji} ${selectedMeeting.name}\n\n`;
    text += `**Ziel:** ${selectedMeeting.goal}\n\n`;
    text += `**Teilnehmer:** ${selectedMeeting.participants.join(", ")}\n\n`;

    text += `## Vor dem Meeting\n`;
    selectedMeeting.beforeMeeting.forEach(item => {
      text += `- [ ] ${item.label}\n`;
    });
    text += "\n";

    text += `## Fragen\n`;
    selectedMeeting.questions.forEach(group => {
      text += `### ${group.category}\n`;
      group.items.forEach(q => {
        text += `- ${q}\n`;
      });
      text += "\n";
    });

    if (selectedMeeting.redFlags.length > 0) {
      text += `## Red Flags\n`;
      selectedMeeting.redFlags.forEach(flag => {
        text += `⚠️ ${flag}\n`;
      });
      text += "\n";
    }

    text += `## Nach dem Meeting\n`;
    selectedMeeting.afterMeeting.forEach(item => {
      text += `- [ ] ${item.label}\n`;
    });

    return text;
  };

  const handleCopyToClipboard = async () => {
    const content = generateClipboardContent();
    await navigator.clipboard.writeText(content);
  };

  const handleExportPdf = async () => {
    if (!contentRef.current || !selectedMeeting) return;
    await exportElementToPdf(contentRef.current, {
      filename: `meeting-prep-${selectedMeeting.id}.pdf`,
    });
  };

  const handleExportWord = async () => {
    if (!selectedMeeting) return;
    await exportMeetingToWord(selectedMeeting);
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {selectedMeeting && (
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Alle Meetings
          </Button>
        )}
        
        {selectedMeeting && (
          <div className="ml-auto">
            <ExportButtons
              onExportPdf={handleExportPdf}
              onExportWord={handleExportWord}
              onCopyToClipboard={handleCopyToClipboard}
            />
          </div>
        )}
      </div>

      {!selectedMeeting ? (
        <>
          <div className="mb-4 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold">Meeting-Vorbereitung</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Checklisten und Fragen für 5 wichtige Meeting-Typen im Data-Science-Projekt.
            </p>
          </div>

          {/* Meeting Type Selection */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meetingTypes.map((meeting) => (
              <MeetingTypeCard
                key={meeting.id}
                meeting={meeting}
                onClick={() => setSelectedMeetingId(meeting.id)}
              />
            ))}
          </div>

          {/* Info Note */}
          <div className="mt-6 md:mt-8 p-3 md:p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p>
              💡 <strong>Tipp:</strong> Die Checkboxen sind nur für diese Session – 
              sie werden nicht gespeichert. Exportiere das Dokument als PDF oder 
              kopiere es, um es zu teilen.
            </p>
          </div>
        </>
      ) : (
        <>
          <div ref={contentRef}>
            <MeetingDetail meeting={selectedMeeting} />
          </div>
          
          <div className="flex justify-between pt-6 border-t mt-8">
            <Button variant="outline" onClick={handleBack}>
              Anderes Meeting wählen
            </Button>
            <ExportButtons
              onExportPdf={handleExportPdf}
              onExportWord={handleExportWord}
              onCopyToClipboard={handleCopyToClipboard}
            />
          </div>
        </>
      )}
    </div>
  );
}
