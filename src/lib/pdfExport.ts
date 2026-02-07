import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PdfExportOptions {
  filename: string;
  margin?: number;
  scale?: number;
}

export async function exportElementToPdf(
  element: HTMLElement,
  options: PdfExportOptions
): Promise<void> {
  const { filename, margin = 10, scale = 2 } = options;

  // Render DOM to canvas with higher quality
  const canvas = await html2canvas(element, {
    scale: scale,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  // Calculate dimensions for A4 page
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  const imgWidth = pageWidth - 2 * margin;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const imgData = canvas.toDataURL("image/png");

  let heightLeft = imgHeight;
  let position = margin;

  // Add first page
  pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
  heightLeft -= (pageHeight - 2 * margin);

  // Add subsequent pages if needed
  while (heightLeft > 0) {
    position = heightLeft - imgHeight + margin;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - 2 * margin);
  }

  pdf.save(filename);
}
