import React, { useState, useRef, useEffect } from 'react';
import { useDrugContext } from '../context/useDrugContext';
import { FaQrcode, FaUserMd, FaIdCard, FaSpinner, FaDownload, FaShareAlt, FaRobot, FaExclamationTriangle } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import '../styles/UniversalHealthID.css';

// Simulate AI analysis of medical conditions and medications
const generateAIInsights = (formData: any) => {
  const insights = [];
  const recommendations = [];
  const emergencyNotes = [];
  
  // Check for allergies
  if (formData.allergies && formData.allergies.toLowerCase().includes('penicillin')) {
    insights.push('Penicillin allergy detected - This is a common antibiotic allergy');
    recommendations.push('Alert healthcare providers about penicillin allergy before any treatment');
    emergencyNotes.push('DO NOT ADMINISTER PENICILLIN OR RELATED ANTIBIOTICS');
  }
  
  // Check for conditions
  if (formData.conditions) {
    const conditions = formData.conditions.toLowerCase();
    
    if (conditions.includes('diabetes')) {
      insights.push('Diabetes detected - Blood sugar monitoring may be necessary');
      recommendations.push('Regular blood glucose monitoring recommended');
      emergencyNotes.push('CHECK BLOOD GLUCOSE LEVELS IF UNCONSCIOUS');
    }
    
    if (conditions.includes('asthma')) {
      insights.push('Asthma detected - May require bronchodilators during respiratory distress');
      recommendations.push('Keep rescue inhaler accessible at all times');
      emergencyNotes.push('MAY NEED BRONCHODILATOR TREATMENT IN EMERGENCY');
    }
    
    if (conditions.includes('heart') || conditions.includes('cardiac') || conditions.includes('hypertension')) {
      insights.push('Cardiovascular condition detected - Monitoring heart function important');
      recommendations.push('Regular blood pressure monitoring recommended');
    }
    
    if (conditions.includes('seizure') || conditions.includes('epilepsy')) {
      insights.push('Seizure history detected - May require anticonvulsant medication');
      recommendations.push('Follow seizure action plan as prescribed by physician');
      emergencyNotes.push('SEIZURE PRECAUTIONS MAY BE NEEDED - PROTECT HEAD, CLEAR AREA');
    }
  }
  
  // Check for medications
  if (formData.medications) {
    const medications = formData.medications.toLowerCase();
    
    if (medications.includes('insulin')) {
      insights.push('Insulin medication detected - Indicates diabetes management');
      recommendations.push('Carry fast-acting glucose source for hypoglycemia');
      emergencyNotes.push('RISK OF HYPOGLYCEMIA - MAY NEED GLUCOSE IF UNCONSCIOUS');
    }
    
    if (medications.includes('warfarin') || medications.includes('coumadin') || medications.includes('blood thinner')) {
      insights.push('Blood thinner medication detected - Increased bleeding risk');
      recommendations.push('Inform healthcare providers before any procedures');
      emergencyNotes.push('ANTICOAGULANT THERAPY - INCREASED BLEEDING RISK');
    }
    
    // Check for medication interactions (basic simulation)
    if (medications.includes('ssri') && medications.includes('maoi')) {
      insights.push('Potential dangerous interaction between SSRI and MAOI medications detected');
      recommendations.push('Consult physician immediately about this medication combination');
      emergencyNotes.push('POTENTIALLY DANGEROUS MEDICATION COMBINATION PRESENT');
    }
  }
  
  // Add generic insights if none specific found
  if (insights.length === 0) {
    insights.push('No specific medical concerns identified from provided information');
    recommendations.push('Maintain regular healthcare check-ups');
  }
  
  return {
    insights,
    recommendations,
    emergencyNotes,
    generatedAt: new Date().toISOString(),
  };
};

const UniversalHealthID: React.FC = () => {
  const { healthData, saveHealthData } = useDrugContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [nftGenerated, setNftGenerated] = useState(false);
  const qrCodeRef = useRef<SVGSVGElement>(null);
  const [formData, setFormData] = useState({
    name: healthData?.name || '',
    age: healthData?.age || '',
    bloodType: healthData?.bloodType || '',
    allergies: healthData?.allergies || '',
    conditions: healthData?.conditions || '',
    medications: healthData?.currentMedications?.join(', ') || '',
    emergencyContact: healthData?.emergencyContact || '',
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load saved QR data on component mount
  useEffect(() => {
    const savedQRData = localStorage.getItem('healthIDData');
    if (savedQRData) {
      try {
        const parsedData = JSON.parse(savedQRData);
        setFormData({
          name: parsedData.name || '',
          age: parsedData.age || '',
          bloodType: parsedData.bloodType || '',
          allergies: parsedData.allergies || '',
          conditions: parsedData.conditions || '',
          medications: (parsedData.medications || []).join(', '),
          emergencyContact: parsedData.emergencyContact || '',
        });
        
        // If there's AI analysis saved, load that too
        if (parsedData.aiAnalysis) {
          setAiAnalysis(parsedData.aiAnalysis);
        }
      } catch (error) {
        console.error('Error parsing saved health ID data', error);
      }
    }

    // Check if we should show QR code immediately
    const hasGeneratedQR = localStorage.getItem('hasGeneratedHealthQR') === 'true';
    if (hasGeneratedQR) {
      setNftGenerated(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateHealthNFT = () => {
    setIsGenerating(true);
    
    // Generate AI insights
    const analysis = generateAIInsights(formData);
    setAiAnalysis(analysis);
    
    // Save the health data to context with AI analysis
    const newHealthData = {
      name: formData.name,
      age: formData.age,
      bloodType: formData.bloodType,
      allergies: formData.allergies,
      conditions: formData.conditions,
      currentMedications: formData.medications.split(',').map(med => med.trim()),
      emergencyContact: formData.emergencyContact,
      aiAnalysis: analysis,
    };
    
    // Save to localStorage for persistence
    localStorage.setItem('healthIDData', JSON.stringify(newHealthData));
    localStorage.setItem('hasGeneratedHealthQR', 'true');
    
    saveHealthData(newHealthData);
    
    // Simulate NFT generation process
    setTimeout(() => {
      setIsGenerating(false);
      setNftGenerated(true);
    }, 2000);
  };

  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      const analysis = generateAIInsights(formData);
      setAiAnalysis(analysis);
      
      // Update localStorage with new analysis
      const savedData = localStorage.getItem('healthIDData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          parsedData.aiAnalysis = analysis;
          localStorage.setItem('healthIDData', JSON.stringify(parsedData));
        } catch (error) {
          console.error('Error updating AI analysis in storage', error);
        }
      }
      
      setIsAnalyzing(false);
      setAiMode(true);
    }, 1500);
  };

  const getQRCodeData = () => {
    // Create a well-formatted text that will display nicely when scanned
    // Using emojis and clear formatting to make the data more visually appealing
    
    // Add AI emergency notes if available
    let emergencyNotesText = '';
    if (aiAnalysis && aiAnalysis.emergencyNotes && aiAnalysis.emergencyNotes.length > 0) {
      emergencyNotesText = `\n⚠️ AI EMERGENCY ALERTS:\n${aiAnalysis.emergencyNotes.join('\n')}\n`;
    }
    
    const medicalData = 
`🏥 MEDICAL ID: ${formData.name} 🏥
------------------------
📋 PERSONAL INFO:
👤 Name: ${formData.name}
🔢 Age: ${formData.age}
🩸 Blood Type: ${formData.bloodType}
📞 Emergency: ${formData.emergencyContact}

⚠️ ALLERGIES:
${formData.allergies || 'None listed'}

🩺 MEDICAL CONDITIONS:
${formData.conditions || 'None listed'}

💊 MEDICATIONS:
${formData.medications || 'None listed'}${emergencyNotesText}
------------------------
⏱️ Created: ${new Date().toLocaleDateString()}
EMERGENCY MEDICAL INFORMATION
PLEASE CONTACT HEALTHCARE PROVIDER`;

    return medicalData;
  };

  const downloadQRCode = () => {
    if (!qrCodeRef.current) return;
    
    const svg = qrCodeRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      // Download the PNG file
      const downloadLink = document.createElement("a");
      downloadLink.download = `HealthID-${formData.name.replace(/\s+/g, '-')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        const canvas = document.createElement("canvas");
        const svg = qrCodeRef.current;
        if (!svg) return;
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        
        img.onload = async () => {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            
            try {
              await navigator.share({
                title: `${formData.name}'s Health ID`,
                text: 'My emergency medical information QR code',
                files: [new File([blob], 'HealthID.png', { type: 'image/png' })]
              });
            } catch (error) {
              console.error('Error sharing:', error);
              alert('Could not share the QR code. Try downloading it instead.');
            }
          }, 'image/png');
        };
        
        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
      } catch (error) {
        console.error('Error preparing share:', error);
      }
    } else {
      alert('Sharing is not supported on this device. Please download the QR code instead.');
    }
  };

  const testQRData = () => {
    setPreviewMode(true);
    setAiMode(false);
  };

  return (
    <motion.div 
      className="universal-id-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="universal-id-header">
        <h1><FaIdCard className="header-icon" /> Universal Health ID</h1>
        <p className="id-description">Generate a secure NFT with AI insights to share your health information during emergencies</p>
      </div>

      {!nftGenerated ? (
        <div className="health-data-form">
          <div className="form-section">
            <h3><FaUserMd /> Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  type="text"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Your age"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bloodType">Blood Type</label>
                <input
                  type="text"
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  placeholder="e.g., A+, O-, etc."
                />
              </div>
              <div className="form-group">
                <label htmlFor="emergencyContact">Emergency Contact</label>
                <input
                  type="text"
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Emergency contact info"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Medical Information</h3>
            <div className="form-group">
              <label htmlFor="allergies">Allergies</label>
              <textarea
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                placeholder="List any allergies (e.g. penicillin, peanuts, etc.)"
              />
            </div>
            <div className="form-group">
              <label htmlFor="conditions">Medical Conditions</label>
              <textarea
                id="conditions"
                name="conditions"
                value={formData.conditions}
                onChange={handleInputChange}
                placeholder="List any medical conditions (e.g. diabetes, asthma, etc.)"
              />
            </div>
            <div className="form-group">
              <label htmlFor="medications">Current Medications</label>
              <textarea
                id="medications"
                name="medications"
                value={formData.medications}
                onChange={handleInputChange}
                placeholder="List medications, separated by commas (e.g. insulin, aspirin, etc.)"
              />
            </div>
          </div>

          <div className="ai-notice">
            <FaRobot className="ai-icon" /> 
            <span>Our AI will analyze your health data to provide emergency recommendations and insights</span>
          </div>

          <div className="form-actions">
            <button 
              className="generate-button"
              onClick={generateHealthNFT}
              disabled={isGenerating || !formData.name}
            >
              {isGenerating ? (
                <>
                  <FaSpinner className="spinning" /> Generating with AI...
                </>
              ) : (
                <>
                  <FaQrcode /> Generate Health ID with AI
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <motion.div 
          className="nft-result"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {previewMode ? (
            <motion.div 
              className="data-preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="preview-header">
                <h2>Medical ID Data Preview</h2>
                <p>This is how your data will appear when scanned</p>
              </div>
              
              <div className="preview-card">
                <div className="preview-section preview-header-section">
                  <h3>🏥 Medical ID</h3>
                </div>
                <div className="preview-section">
                  <h3>📋 Personal Information</h3>
                  <p><span className="emoji-icon">👤</span> <strong>Name:</strong> {formData.name}</p>
                  <p><span className="emoji-icon">🔢</span> <strong>Age:</strong> {formData.age}</p>
                  <p><span className="emoji-icon">🩸</span> <strong>Blood Type:</strong> {formData.bloodType}</p>
                  <p><span className="emoji-icon">📞</span> <strong>Emergency Contact:</strong> {formData.emergencyContact}</p>
                </div>
                
                <div className="preview-section">
                  <h3>Medical Information</h3>
                  <div className="preview-subsection">
                    <h4><span className="emoji-icon">⚠️</span> Allergies</h4>
                    <p>{formData.allergies || 'None specified'}</p>
                  </div>
                  
                  <div className="preview-subsection">
                    <h4><span className="emoji-icon">🩺</span> Medical Conditions</h4>
                    <p>{formData.conditions || 'None specified'}</p>
                  </div>
                  
                  <div className="preview-subsection">
                    <h4><span className="emoji-icon">💊</span> Medications</h4>
                    <p>{formData.medications || 'None specified'}</p>
                  </div>
                </div>
                
                {aiAnalysis && aiAnalysis.emergencyNotes && aiAnalysis.emergencyNotes.length > 0 && (
                  <div className="preview-section preview-emergency">
                    <h4><span className="emoji-icon">⚠️</span> AI Emergency Alerts</h4>
                    {aiAnalysis.emergencyNotes.map((note: string, i: number) => (
                      <p key={i} className="emergency-alert"><FaExclamationTriangle /> {note}</p>
                    ))}
                  </div>
                )}
                
                <div className="preview-section preview-footer">
                  <p><span className="emoji-icon">⏱️</span> <strong>Created:</strong> {new Date().toLocaleDateString()}</p>
                  <p className="emergency-text">EMERGENCY MEDICAL INFORMATION</p>
                </div>
              </div>
              
              <div className="preview-actions">
                <button 
                  className="action-button back-button"
                  onClick={() => setPreviewMode(false)}
                >
                  Back to QR Code
                </button>
                {aiAnalysis && (
                  <button 
                    className="action-button ai-button"
                    onClick={() => {
                      setPreviewMode(false);
                      setAiMode(true);
                    }}
                  >
                    <FaRobot /> View AI Insights
                  </button>
                )}
              </div>
              
              <div className="preview-note">
                <p>This is exactly what healthcare providers will see when they scan your QR code.</p>
                <p>All data is contained directly in the QR code - no internet connection required.</p>
              </div>
            </motion.div>
          ) : aiMode ? (
            <motion.div 
              className="ai-analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="ai-header">
                <h2><FaRobot /> AI Health Insights</h2>
                <p>Personalized analysis based on your health information</p>
              </div>
              
              <div className="ai-card">
                <div className="ai-section">
                  <h3>Medical Insights</h3>
                  {aiAnalysis?.insights.map((insight: string, i: number) => (
                    <div key={i} className="ai-insight">
                      <div className="insight-bullet">AI</div>
                      <p>{insight}</p>
                    </div>
                  ))}
                </div>
                
                <div className="ai-section">
                  <h3>Recommendations</h3>
                  <ul className="recommendation-list">
                    {aiAnalysis?.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
                
                {aiAnalysis?.emergencyNotes && aiAnalysis.emergencyNotes.length > 0 && (
                  <div className="ai-section emergency-section">
                    <h3>Emergency Alerts</h3>
                    {aiAnalysis.emergencyNotes.map((note: string, i: number) => (
                      <div key={i} className="emergency-alert">
                        <FaExclamationTriangle className="alert-icon" />
                        <p>{note}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="ai-footer">
                  <p>AI analysis generated on {new Date(aiAnalysis?.generatedAt).toLocaleDateString()}</p>
                  <p className="ai-disclaimer">This analysis is intended for informational purposes only and does not replace professional medical advice.</p>
                </div>
              </div>
              
              <div className="ai-actions">
                <button 
                  className="action-button back-button"
                  onClick={() => setAiMode(false)}
                >
                  Back to QR Code
                </button>
                <button 
                  className="action-button preview-button"
                  onClick={() => {
                    setAiMode(false);
                    setPreviewMode(true);
                  }}
                >
                  <FaQrcode /> View QR Data
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="nft-card">
                <div className="nft-header">
                  <h2>Universal Health ID</h2>
                  <p>Scan this QR code to access health information</p>
                </div>
                <div className="qr-code-container">
                  <QRCodeSVG 
                    ref={qrCodeRef}
                    value={getQRCodeData()} 
                    size={300}
                    level="L" 
                    includeMargin={true}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                  />
                </div>
                <div className="nft-details">
                  <h3>{formData.name}</h3>
                  <p><strong>Blood Type:</strong> {formData.bloodType}</p>
                  <p><strong>Age:</strong> {formData.age}</p>
                  {aiAnalysis?.emergencyNotes && aiAnalysis.emergencyNotes.length > 0 && (
                    <div className="emergency-badge">
                      <FaExclamationTriangle /> AI Emergency Alerts
                    </div>
                  )}
                  <p className="small-text">Created on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="nft-actions">
                <button 
                  className="action-button download-button"
                  onClick={downloadQRCode}
                >
                  <FaDownload /> Download QR Code
                </button>
                <button 
                  className="action-button share-button"
                  onClick={shareQRCode}
                >
                  <FaShareAlt /> Share
                </button>
                <button 
                  className="action-button test-button"
                  onClick={testQRData}
                >
                  <FaQrcode /> Test QR Code
                </button>
                {aiAnalysis ? (
                  <button 
                    className="action-button ai-button"
                    onClick={() => setAiMode(true)}
                  >
                    <FaRobot /> AI Insights
                  </button>
                ) : (
                  <button 
                    className="action-button ai-button"
                    onClick={runAIAnalysis}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <FaSpinner className="spinning" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <FaRobot /> Run AI Analysis
                      </>
                    )}
                  </button>
                )}
                <button 
                  className="action-button reset-button"
                  onClick={() => {
                    setNftGenerated(false);
                    localStorage.removeItem('hasGeneratedHealthQR');
                  }}
                >
                  Edit Info
                </button>
              </div>
              <div className="nft-instructions">
                <h4>How to use your Health ID:</h4>
                <ol>
                  <li>Download and print this QR code</li>
                  <li>Keep it in your wallet or on your phone</li>
                  <li>Healthcare providers can scan it for your medical information</li>
                  <li>Use AI insights to better understand your health profile</li>
                  <li>Update your information as needed</li>
                </ol>
                <p className="validity-note">This QR code will remain valid as long as your browser data is not cleared. Your data is stored locally on your device for privacy.</p>
                <p className="privacy-note">Your data is stored securely on your device only and accessible via this QR code.</p>
              </div>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default UniversalHealthID; 