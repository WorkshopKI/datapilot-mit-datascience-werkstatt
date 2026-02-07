import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
import { saveAs } from "file-saver";
import type { MeetingType } from "@/data/meetingPrepData";

export async function exportMeetingToWord(meeting: MeetingType): Promise<void> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: `${meeting.emoji} ${meeting.name}`,
      heading: HeadingLevel.HEADING_1,
    })
  );

  // Goal
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Ziel: ", bold: true }),
        new TextRun(meeting.goal),
      ],
    })
  );

  // Empty line
  children.push(new Paragraph({ text: "" }));

  // Participants
  children.push(
    new Paragraph({
      text: "Teilnehmer",
      heading: HeadingLevel.HEADING_2,
    })
  );
  meeting.participants.forEach((p) => {
    children.push(
      new Paragraph({
        text: p,
        bullet: { level: 0 },
      })
    );
  });

  // Empty line
  children.push(new Paragraph({ text: "" }));

  // Before Meeting
  children.push(
    new Paragraph({
      text: "Vor dem Meeting",
      heading: HeadingLevel.HEADING_2,
    })
  );
  meeting.beforeMeeting.forEach((item) => {
    children.push(
      new Paragraph({
        children: [new TextRun("☐ "), new TextRun(item.label)],
      })
    );
  });

  // Empty line
  children.push(new Paragraph({ text: "" }));

  // Questions
  children.push(
    new Paragraph({
      text: "Fragen",
      heading: HeadingLevel.HEADING_2,
    })
  );
  meeting.questions.forEach((group) => {
    children.push(
      new Paragraph({
        text: group.category,
        heading: HeadingLevel.HEADING_3,
      })
    );
    group.items.forEach((q) => {
      children.push(new Paragraph({ text: `→ ${q}` }));
    });
    children.push(new Paragraph({ text: "" }));
  });

  // Red Flags
  if (meeting.redFlags && meeting.redFlags.length > 0) {
    children.push(
      new Paragraph({
        text: "Red Flags",
        heading: HeadingLevel.HEADING_2,
      })
    );
    meeting.redFlags.forEach((flag) => {
      children.push(new Paragraph({ text: `⚠️ ${flag}` }));
    });
    children.push(new Paragraph({ text: "" }));
  }

  // After Meeting
  children.push(
    new Paragraph({
      text: "Nach dem Meeting",
      heading: HeadingLevel.HEADING_2,
    })
  );
  meeting.afterMeeting.forEach((item) => {
    children.push(
      new Paragraph({
        children: [new TextRun("☐ "), new TextRun(item.label)],
      })
    );
  });

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `meeting-prep-${meeting.id}.docx`);
}

interface StarterKitData {
  projectName: string;
  problemType: { id: string; name: string; emoji: string };
  industry: { id: string; name: string; emoji: string };
  context: { context: string; typischeKPIs: string; typischeIntervention: string };
  checklists: Record<string, string[]>;
  pitfalls: Array<{ title: string; description: string }>;
  dataSources: string[];
}

export async function exportStarterKitToWord(data: StarterKitData): Promise<void> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: data.projectName || "Projekt-Starter Kit",
      heading: HeadingLevel.HEADING_1,
    })
  );

  // Scenario
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Szenario: ", bold: true }),
        new TextRun(`${data.problemType.emoji} ${data.problemType.name} × ${data.industry.emoji} ${data.industry.name}`),
      ],
    })
  );

  // Empty line
  children.push(new Paragraph({ text: "" }));

  // Context
  children.push(
    new Paragraph({
      text: "Kontext",
      heading: HeadingLevel.HEADING_2,
    })
  );
  children.push(new Paragraph({ text: data.context.context }));
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Typische KPIs: ", bold: true }),
        new TextRun(data.context.typischeKPIs),
      ],
    })
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Typische Intervention: ", bold: true }),
        new TextRun(data.context.typischeIntervention),
      ],
    })
  );

  // Empty line
  children.push(new Paragraph({ text: "" }));

  // Checklists
  children.push(
    new Paragraph({
      text: "Checklisten",
      heading: HeadingLevel.HEADING_2,
    })
  );

  const phaseNames: Record<string, string> = {
    business: "1. Business Understanding",
    data: "2. Data Understanding",
    preparation: "3. Data Preparation",
    modeling: "4. Modeling",
    evaluation: "5. Evaluation",
    deployment: "6. Deployment",
  };

  const phases = ["business", "data", "preparation", "modeling", "evaluation", "deployment"];
  phases.forEach((phase) => {
    children.push(
      new Paragraph({
        text: phaseNames[phase],
        heading: HeadingLevel.HEADING_3,
      })
    );
    data.checklists[phase]?.forEach((item) => {
      children.push(
        new Paragraph({
          children: [new TextRun("☐ "), new TextRun(item)],
        })
      );
    });
    children.push(new Paragraph({ text: "" }));
  });

  // Data Sources
  if (data.dataSources.length > 0) {
    children.push(
      new Paragraph({
        text: `Typische Datenquellen (${data.industry.name})`,
        heading: HeadingLevel.HEADING_2,
      })
    );
    data.dataSources.forEach((source) => {
      children.push(
        new Paragraph({
          text: source,
          bullet: { level: 0 },
        })
      );
    });
    children.push(new Paragraph({ text: "" }));
  }

  // Pitfalls
  if (data.pitfalls.length > 0) {
    children.push(
      new Paragraph({
        text: `Typische Stolperfallen (${data.problemType.name})`,
        heading: HeadingLevel.HEADING_2,
      })
    );
    data.pitfalls.forEach((pitfall) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `⚠️ ${pitfall.title}: `, bold: true }),
            new TextRun(pitfall.description),
          ],
        })
      );
    });
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `starter-kit-${data.problemType.id}-${data.industry.id}.docx`);
}
