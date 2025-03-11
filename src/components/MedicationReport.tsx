import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaExclamationTriangle, FaHeartbeat, FaUserMd, 
  FaShieldAlt, FaChartLine, FaPills, FaInfoCircle, FaClock, 
  FaChevronDown, FaChevronUp, FaStethoscope, FaCalendarAlt,
  FaUtensils, FaRunning, FaExclamationCircle, FaCheckCircle,
  FaFileMedical, FaFlask, FaBrain, FaDownload, FaFilePdf
} from 'react-icons/fa';
import { MedicationReportData } from '../types/types';
import '../styles/MedicationReport.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface MedicationReportProps {
  report: MedicationReportData;
}

const MedicationReport: React.FC<MedicationReportProps> = ({ report }) => {
  const { medications, interactions, summary, aiAnalysis } = report;
  const [expandedSection, setExpandedSection] = useState<string[]>(['overview', 'medications']);
  const [isDownloading, setIsDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const toggleSection = (section: string) => {
    setExpandedSection(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const isSectionExpanded = (section: string) => expandedSection.includes(section);

  // Helper function to get severity color class
  const getSeverityClass = (severity: string): string => {
    const lowerSeverity = severity.toLowerCase();
    if (lowerSeverity.includes('contraindicated') || lowerSeverity.includes('severe') || lowerSeverity.includes('high')) return 'severe';
    if (lowerSeverity.includes('moderate')) return 'moderate';
    if (lowerSeverity.includes('minor') || lowerSeverity.includes('low')) return 'minor';
    return 'unknown';
  };

  // Function to download the report as PDF
  const downloadPDF = async () => {
    if (!reportRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // Expand all sections for the PDF
      const originalExpanded = [...expandedSection];
      setExpandedSection(['overview', 'medications', 'interactions', 'monitoring', 'timing', 'lifestyle', 'considerations']);
      
      // Wait for state update to take effect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a clone of the report element to modify for PDF
      const reportElement = reportRef.current;
      
      // Force background colors to be included
      const originalStyle = window.getComputedStyle(document.body);
      const originalBg = document.body.style.background;
      document.body.style.background = 'white';
      
      // Apply specific styles for PDF generation
      const tempStyle = document.createElement('style');
      tempStyle.innerHTML = `
        .medication-report * {
          color: black !important;
          background-color: white !important;
          box-shadow: none !important;
          text-shadow: none !important;
        }
        .glass-panel {
          background: white !important;
          border: 1px solid #ddd !important;
        }
        .section-header, .med-header, .interaction-item, .monitoring-item, .timing-item, .lifestyle-item, .consideration-item {
          background: #f5f5f5 !important;
          color: black !important;
        }
        .severe { color: #d32f2f !important; background: #ffebee !important; }
        .moderate { color: #f57c00 !important; background: #fff3e0 !important; }
        .minor { color: #388e3c !important; background: #e8f5e9 !important; }
        .unknown { color: #616161 !important; background: #f5f5f5 !important; }
      `;
      document.head.appendChild(tempStyle);
      
      // Generate PDF with better quality
      const canvas = await html2canvas(reportElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        allowTaint: true,
        foreignObjectRendering: false, // Try setting this to false
        onclone: (clonedDoc) => {
          // Additional modifications to the cloned document if needed
          const clonedReport = clonedDoc.querySelector('.medication-report');
          if (clonedReport) {
            clonedReport.querySelectorAll('.glass-panel').forEach(panel => {
              (panel as HTMLElement).style.background = 'white';
              (panel as HTMLElement).style.border = '1px solid #ddd';
            });
          }
        }
      });
      
      // Clean up temporary styles
      document.head.removeChild(tempStyle);
      document.body.style.background = originalBg;
      
      const imgData = canvas.toDataURL('image/png');
      
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
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      // Calculate how many pages we need
      const totalPages = Math.ceil(imgHeight * ratio / pdfHeight);
      
      // Add each page
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        // Calculate which part of the image to use for this page
        const sourceY = page * pdfHeight / ratio;
        const sourceHeight = Math.min(pdfHeight / ratio, imgHeight - sourceY);
        
        pdf.addImage(
          imgData, 
          'PNG', 
          imgX, 
          0, 
          imgWidth * ratio, 
          imgHeight * ratio, 
          undefined, 
          'FAST',
          0,
          sourceY,
          imgWidth,
          sourceHeight
        );
      }
      
      // Generate filename with date and medications
      const date = new Date().toISOString().split('T')[0];
      const medNames = medications.map(m => m.name.replace(/\s+/g, '_')).join('-');
      const filename = `Medication_Report_${date}_${medNames}.pdf`;
      
      // Download the PDF
      pdf.save(filename);
      
      // Restore original expanded sections
      setExpandedSection(originalExpanded);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper functions for PDF colors
  const getRiskColor = (risk: string): number[] => {
    const lowerRisk = risk.toLowerCase();
    if (lowerRisk.includes('high')) return [220, 0, 0]; // Red
    if (lowerRisk.includes('moderate')) return [230, 126, 0]; // Orange
    if (lowerRisk.includes('low')) return [0, 128, 0]; // Green
    return [0, 0, 0]; // Black
  };

  const getSeverityPdfColor = (severity: string): number[] => {
    const lowerSeverity = severity.toLowerCase();
    if (lowerSeverity.includes('contraindicated') || lowerSeverity.includes('severe')) return [220, 0, 0]; // Red
    if (lowerSeverity.includes('moderate')) return [230, 126, 0]; // Orange
    if (lowerSeverity.includes('minor') || lowerSeverity.includes('low')) return [0, 128, 0]; // Green
    return [100, 100, 100]; // Gray
  };

  return (
    <motion.div 
      className="medication-report"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      ref={reportRef}
    >
      {/* Report Header */}
      <header className="report-header glass-panel">
        <div className="header-content">
          <div className="header-left">
            <FaFileMedical className="header-icon" />
            <div className="header-text">
              <h1>Comprehensive Medication Analysis</h1>
              <p className="timestamp">Generated on {new Date(report.timestamp).toLocaleString()}</p>
            </div>
          </div>
          <div className="header-right">
            <div className="risk-indicator">
              <span className={`risk-level ${getSeverityClass(aiAnalysis.overallRiskLevel)}`}>
                <FaExclamationCircle /> {aiAnalysis.overallRiskLevel} Risk
              </span>
            </div>
            <button 
              className="download-button" 
              onClick={downloadPDF}
              disabled={isDownloading}
              aria-label="Download PDF report"
            >
              {isDownloading ? (
                <span className="download-text"><FaDownload className="download-icon spin" /> Generating...</span>
              ) : (
                <span className="download-text"><FaFilePdf className="download-icon" /> Download PDF</span>
              )}
            </button>
          </div>
        </div>
        
        <div className="report-summary">
          <p className="summary-text">
            This report analyzes {summary.totalMedications} medications with {summary.totalInteractions} potential interactions.
            {summary.requiresImmediateAttention && 
              <span className="attention-required"><FaExclamationTriangle /> Requires immediate attention</span>
            }
          </p>
        </div>
      </header>

      {/* Quick Stats Dashboard */}
      <section className="quick-stats glass-panel">
        <div className="stat-card">
          <FaPills className="stat-icon" />
          <div className="stat-content">
            <h3>Medications</h3>
            <p>{summary.totalMedications}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaShieldAlt className="stat-icon" />
          <div className="stat-content">
            <h3>Interactions</h3>
            <p>{summary.totalInteractions}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaExclamationTriangle className="stat-icon" />
          <div className="stat-content">
            <h3>Severe</h3>
            <p>{summary.severityBreakdown.severe + summary.severityBreakdown.contraindicated}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaStethoscope className="stat-icon" />
          <div className="stat-content">
            <h3>Monitoring</h3>
            <p>{aiAnalysis.suggestedMonitoring.length}</p>
          </div>
        </div>
      </section>

      {/* Key Findings Alert */}
      {summary.keyFindings.length > 0 && (
        <motion.section 
          className="key-findings glass-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="section-header">
            <div className="section-title">
              <FaExclamationCircle className="section-icon" />
              <h2>Key Findings</h2>
            </div>
          </div>
          <div className="findings-list">
            {summary.keyFindings.map((finding, index) => (
              <div key={index} className="finding-item">
                <FaExclamationTriangle className="finding-icon" />
                <p>{finding}</p>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Medications List */}
      <section className="medications-section glass-panel">
        <div className="section-header" onClick={() => toggleSection('medications')}>
          <div className="section-title">
            <FaPills className="section-icon" />
            <h2>Current Medications</h2>
          </div>
          {isSectionExpanded('medications') ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <AnimatePresence>
          {isSectionExpanded('medications') && (
            <motion.div 
              className="section-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="medications-grid">
                {medications.map(med => (
                  <motion.div 
                    key={med.id} 
                    className="medication-card"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="med-header">
                      <FaPills className="med-icon" />
                      <h3>{med.name}</h3>
                    </div>
                    <div className="med-details">
                      <div className="med-detail-item">
                        <span className="detail-label">Dosage:</span>
                        <span className="detail-value">{med.dosage || 'Not specified'}</span>
                      </div>
                      <div className="med-detail-item">
                        <span className="detail-label">Frequency:</span>
                        <span className="detail-value">{med.frequency || 'Not specified'}</span>
                      </div>
                      {med.drugClass && (
                        <div className="med-detail-item">
                          <span className="detail-label">Class:</span>
                          <span className="detail-value">{med.drugClass}</span>
                        </div>
                      )}
                      {med.commonUsages && med.commonUsages.length > 0 && (
                        <div className="med-detail-item">
                          <span className="detail-label">Used for:</span>
                          <span className="detail-value">{med.commonUsages.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Interactions Section */}
      <section className="interactions-section glass-panel">
        <div className="section-header" onClick={() => toggleSection('interactions')}>
          <div className="section-title">
            <FaFlask className="section-icon" />
            <h2>Drug Interactions</h2>
          </div>
          {isSectionExpanded('interactions') ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <AnimatePresence>
          {isSectionExpanded('interactions') && (
            <motion.div 
              className="section-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {interactions.length > 0 ? (
                <div className="interactions-list">
                  {interactions.map((interaction, index) => (
                    <motion.div 
                      key={index} 
                      className={`interaction-card ${getSeverityClass(interaction.severity)}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="interaction-header">
                        <span className="severity-badge">
                          {interaction.severity === 'Contraindicated' || interaction.severity === 'Severe' ? 
                            <FaExclamationTriangle /> : 
                            interaction.severity === 'Moderate' ? 
                              <FaExclamationCircle /> : 
                              <FaInfoCircle />
                          } 
                          {interaction.severity}
                        </span>
                      </div>
                      <p className="interaction-description">{interaction.description}</p>
                      
                      {interaction.clinicalEffects && interaction.clinicalEffects.length > 0 && (
                        <div className="interaction-detail-section">
                          <h4><FaHeartbeat /> Clinical Effects</h4>
                          <ul className="detail-list">
                            {interaction.clinicalEffects.map((effect, i) => (
                              <li key={i}>{effect}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {interaction.managementSteps && interaction.managementSteps.length > 0 && (
                        <div className="interaction-detail-section">
                          <h4><FaUserMd /> Management</h4>
                          <ul className="detail-list">
                            {interaction.managementSteps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {interaction.recommendation && (
                        <div className="interaction-recommendation">
                          <h4><FaCheckCircle /> Recommendation</h4>
                          <p>{interaction.recommendation}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="no-interactions">
                  <FaCheckCircle className="no-interactions-icon" />
                  <p>No interactions detected between the current medications.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Monitoring Recommendations */}
      <section className="monitoring-section glass-panel">
        <div className="section-header" onClick={() => toggleSection('monitoring')}>
          <div className="section-title">
            <FaStethoscope className="section-icon" />
            <h2>Monitoring Recommendations</h2>
          </div>
          {isSectionExpanded('monitoring') ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <AnimatePresence>
          {isSectionExpanded('monitoring') && (
            <motion.div 
              className="section-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="monitoring-list">
                {aiAnalysis.suggestedMonitoring.map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="monitoring-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FaChartLine className="monitoring-icon" />
                    <p>{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Timing Recommendations */}
      <section className="timing-section glass-panel">
        <div className="section-header" onClick={() => toggleSection('timing')}>
          <div className="section-title">
            <FaClock className="section-icon" />
            <h2>Medication Timing</h2>
          </div>
          {isSectionExpanded('timing') ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <AnimatePresence>
          {isSectionExpanded('timing') && (
            <motion.div 
              className="section-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="timing-list">
                {aiAnalysis.timingRecommendations.map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="timing-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FaCalendarAlt className="timing-icon" />
                    <p>{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Lifestyle Recommendations */}
      <section className="lifestyle-section glass-panel">
        <div className="section-header" onClick={() => toggleSection('lifestyle')}>
          <div className="section-title">
            <FaRunning className="section-icon" />
            <h2>Lifestyle Considerations</h2>
          </div>
          {isSectionExpanded('lifestyle') ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <AnimatePresence>
          {isSectionExpanded('lifestyle') && (
            <motion.div 
              className="section-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="lifestyle-list">
                {aiAnalysis.lifestyleRecommendations.map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="lifestyle-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FaUtensils className="lifestyle-icon" />
                    <p>{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Key Considerations */}
      <section className="considerations-section glass-panel">
        <div className="section-header" onClick={() => toggleSection('considerations')}>
          <div className="section-title">
            <FaBrain className="section-icon" />
            <h2>Key Clinical Considerations</h2>
          </div>
          {isSectionExpanded('considerations') ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        <AnimatePresence>
          {isSectionExpanded('considerations') && (
            <motion.div 
              className="section-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="considerations-list">
                {aiAnalysis.keyConsiderations.map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="consideration-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FaInfoCircle className="consideration-icon" />
                    <p>{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Report Footer */}
      <footer className="report-footer glass-panel">
        <div className="footer-content">
          <div className="disclaimer">
            <FaExclamationCircle className="disclaimer-icon" />
            <p>This report is for informational purposes only and does not replace professional medical advice. Always consult with your healthcare provider before making any changes to your medication regimen.</p>
          </div>
          <div className="report-meta">
            <p>Report ID: {Date.now().toString(36).toUpperCase()}</p>
            <p>Generated: {new Date(report.timestamp).toLocaleString()}</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};

export default MedicationReport;