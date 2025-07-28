import jsPDF from 'jspdf';

export interface CertificateData {
  userName: string;
  courseName: string;
  completionDate: string;
  instructorName?: string;
}

export const generateCertificate = (data: CertificateData): string => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Set background color
  pdf.setFillColor(245, 245, 245);
  pdf.rect(0, 0, 297, 210, 'F');

  // Add border
  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(3);
  pdf.rect(10, 10, 277, 190);

  // Add inner border
  pdf.setLineWidth(1);
  pdf.rect(15, 15, 267, 180);

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(32);
  pdf.setTextColor(59, 130, 246);
  pdf.text('CERTIFICATE OF COMPLETION', 148.5, 50, { align: 'center' });

  // Subtitle
  pdf.setFontSize(16);
  pdf.setTextColor(107, 114, 128);
  pdf.text('This is to certify that', 148.5, 70, { align: 'center' });

  // Student name
  pdf.setFontSize(28);
  pdf.setTextColor(17, 24, 39);
  pdf.text(data.userName, 148.5, 90, { align: 'center' });

  // Course completion text
  pdf.setFontSize(16);
  pdf.setTextColor(107, 114, 128);
  pdf.text('has successfully completed the course', 148.5, 110, { align: 'center' });

  // Course name
  pdf.setFontSize(22);
  pdf.setTextColor(59, 130, 246);
  pdf.text(data.courseName, 148.5, 130, { align: 'center' });

  // Date
  pdf.setFontSize(14);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Completed on ${data.completionDate}`, 148.5, 150, { align: 'center' });

  // Instructor signature (if provided)
  if (data.instructorName) {
    pdf.setFontSize(12);
    pdf.text('Instructor:', 200, 170);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.instructorName, 200, 180);
  }

  // Logo/Seal placeholder
  pdf.setDrawColor(59, 130, 246);
  pdf.setFillColor(59, 130, 246);
  pdf.circle(50, 170, 15, 'FD');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.text('EDU', 50, 173, { align: 'center' });

  return pdf.output('datauristring');
};