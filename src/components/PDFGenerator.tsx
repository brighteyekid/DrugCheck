import React from 'react';
import { FaFilePdf, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MedicationReportData } from '../types/types';

interface PDFGeneratorProps {
  report: MedicationReportData;
  reportRef: React.RefObject<HTMLDivElement>;
  isDownloading: boolean;
  setIsDownloading: (value: boolean) => void;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ 
  report, 
  reportRef, 
  isDownloading, 
  setIsDownloading 
}) => {
  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // Create a clone of the report element
      const reportElement = reportRef.current;
      const clone = reportElement.cloneNode(true) as HTMLElement;
      
      // Store original styles
      const originalBg = document.body.style.background;
      document.body.style.background = 'white';
      
      // Create PDF-specific styles
      const tempStyle = document.createElement('style');
      tempStyle.innerHTML = `
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            margin: 0;
            padding: 0;
            background: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .medication-report {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            box-sizing: border-box !important;
            color: black !important;
          }
          .medication-report * {
            color: black !important;
            background-color: white !important;
            box-shadow: none !important;
            text-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .glass-panel {
            background: white !important;
            border: 1px solid #ddd !important;
            margin-bottom: 20px !important;
            page-break-inside: avoid !important;
            width: 100% !important;
            box-sizing: border-box !important;
            color: black !important;
          }
          .section-header, .med-header, .interaction-item, .monitoring-item, .timing-item, .lifestyle-item, .consideration-item {
            background: #f5f5f5 !important;
            color: black !important;
            page-break-inside: avoid !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .severe { color: #d32f2f !important; background: #ffebee !important; }
          .moderate { color: #f57c00 !important; background: #fff3e0 !important; }
          .minor { color: #388e3c !important; background: #e8f5e9 !important; }
          .unknown { color: #616161 !important; background: #f5f5f5 !important; }
          .medications-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .interactions-list, .monitoring-list, .timing-list, .lifestyle-list, .considerations-list {
            display: flex !important;
            flex-direction: column !important;
            gap: 15px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .download-button {
            display: none !important;
          }
        }
      `;
      document.head.appendChild(tempStyle);
      
      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '210mm'; // A4 width
      tempContainer.appendChild(clone);
      document.body.appendChild(tempContainer);
      
      // Generate canvas with better quality
      const canvas = await html2canvas(clone, {
        scale: 1,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        foreignObjectRendering: true,
        width: clone.offsetWidth,
        height: clone.scrollHeight,
        windowWidth: clone.offsetWidth,
        windowHeight: clone.scrollHeight,
        onclone: (clonedDoc) => {
          // Remove animations and transitions
          clonedDoc.querySelectorAll('*').forEach(el => {
            (el as HTMLElement).style.transition = 'none';
            (el as HTMLElement).style.animation = 'none';
          });
          
          // Ensure proper spacing and width
          const clonedReport = clonedDoc.querySelector('.medication-report');
          if (clonedReport) {
            (clonedReport as HTMLElement).style.width = '100%';
            (clonedReport as HTMLElement).style.position = 'relative';
            (clonedReport as HTMLElement).style.left = '0';
            (clonedReport as HTMLElement).style.color = 'black';
            (clonedReport as HTMLElement).style.backgroundColor = 'white';
          }
        }
      });
      
      // Clean up
      document.body.removeChild(tempContainer);
      document.head.removeChild(tempStyle);
      document.body.style.background = originalBg;
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Create PDF with appropriate dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate the ratio to fit the image to the page width
      const ratio = pdfWidth / imgWidth;
      const imgHeightOnPage = imgHeight * ratio;
      
      // Calculate how many pages we need
      const totalPages = Math.ceil(imgHeightOnPage / pdfHeight);
      
      // Add each page
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        // Calculate which part of the image to use for this page
        const sourceY = page * pdfHeight / ratio;
        
        pdf.addImage(
          imgData, 
          'PNG', 
          0, 
          -page * pdfHeight, 
          pdfWidth, 
          imgHeightOnPage,
          undefined,
          'FAST'
        );
      }
      
      // Generate filename with date and medications
      const date = new Date().toISOString().split('T')[0];
      const medNames = report.medications.map(m => m.name.replace(/\s+/g, '_')).join('-');
      const filename = `Medication_Report_${date}_${medNames}.pdf`;
      
      // Download the PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button 
      className="download-button" 
      onClick={generatePDF}
      disabled={isDownloading}
      aria-label="Download PDF report"
    >
      {isDownloading ? (
        <span className="download-text"><FaDownload className="download-icon spin" /> Generating...</span>
      ) : (
        <span className="download-text"><FaFilePdf className="download-icon" /> Download PDF</span>
      )}
    </button>
  );
};

export default PDFGenerator; 