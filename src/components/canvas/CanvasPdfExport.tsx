import jsPDF from 'jspdf';
import { phases, problemTypes, industries, getScenarioContext } from '@/data/canvasData';
import { CanvasState } from '@/hooks/useCanvasState';

export function exportCanvasToPdf(state: CanvasState) {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 2 * margin;

  // Helper: Add page if needed
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Helper: Add wrapped text
  const addWrappedText = (text: string, fontSize: number, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.5;
    checkPageBreak(lines.length * lineHeight + 5);
    doc.text(lines, margin, y);
    y += lines.length * lineHeight + 3;
  };

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CRISP-DM Canvas', margin, y);
  y += 10;

  // Scenario info
  const problemType = problemTypes.find(p => p.id === state.problemType);
  const industry = industries.find(i => i.id === state.industry);
  
  if (problemType && industry) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Szenario: ${problemType.name} x ${industry.name}`, margin, y);
    y += 7;
  }

  // Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, margin, y);
  doc.setTextColor(0);
  y += 12;

  // Separator
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Context
  if (state.problemType && state.industry) {
    const context = getScenarioContext(state.problemType, state.industry);
    
    addWrappedText('KONTEXT', 12, true);
    y += 2;
    addWrappedText(context.context, 10);
    y += 2;
    addWrappedText(`Typische KPIs: ${context.typischeKPIs}`, 9);
    addWrappedText(`Typische Intervention: ${context.typischeIntervention}`, 9);
    y += 8;

    // Separator
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  // Phases
  phases.forEach((phase, index) => {
    checkPageBreak(50);

    // Phase header
    addWrappedText(`${index + 1}. ${phase.name.toUpperCase()}`, 12, true);
    addWrappedText(phase.kernfrage, 10);
    y += 2;

    // Notes
    const note = state.notes[phase.id];
    if (note && note.trim()) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Notizen:', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(note, contentWidth - 10);
      checkPageBreak(noteLines.length * 5 + 5);
      noteLines.forEach((line: string) => {
        doc.text(`> ${line}`, margin + 5, y);
        y += 5;
      });
      y += 3;
    }

    // Checks
    phase.checks.forEach(check => {
      const checkKey = `${phase.id}-${check.id}`;
      const isChecked = state.checks[checkKey] || false;
      const checkmark = isChecked ? '[x]' : '[ ]';
      
      checkPageBreak(6);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${checkmark} ${check.label}`, margin + 5, y);
      y += 5;
    });

    y += 8;

    // Separator
    if (index < phases.length - 1) {
      doc.setDrawColor(220);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    }
  });

  // Summary
  checkPageBreak(40);
  y += 5;
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  addWrappedText('ZUSAMMENFASSUNG', 12, true);
  y += 2;

  // Progress
  const totalChecks = 24;
  const completedChecks = Object.values(state.checks).filter(Boolean).length;
  const percentage = Math.round((completedChecks / totalChecks) * 100);
  addWrappedText(`Fortschritt: ${completedChecks}/${totalChecks} Checks (${percentage}%)`, 11);
  y += 3;

  // Open items
  const openItems: string[] = [];
  phases.forEach(phase => {
    phase.checks.forEach(check => {
      const checkKey = `${phase.id}-${check.id}`;
      if (!state.checks[checkKey]) {
        openItems.push(`${phase.name}: ${check.label}`);
      }
    });
  });

  if (openItems.length > 0) {
    y += 3;
    addWrappedText('Offene Punkte:', 10, true);
    openItems.slice(0, 10).forEach(item => {
      checkPageBreak(6);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`• ${item}`, margin + 5, y);
      y += 5;
    });
    if (openItems.length > 10) {
      doc.text(`... und ${openItems.length - 10} weitere`, margin + 5, y);
    }
  }

  // Save
  const fileName = problemType && industry 
    ? `canvas-${problemType.id}-${industry.id}-${new Date().toISOString().split('T')[0]}.pdf`
    : `canvas-${new Date().toISOString().split('T')[0]}.pdf`;
  
  doc.save(fileName);
}
