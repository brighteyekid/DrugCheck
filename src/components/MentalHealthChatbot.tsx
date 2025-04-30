import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { useDrugContext } from '../context/useDrugContext';
import { Message } from '../types/types';
import '../styles/MentalHealthChatbot.css';

const MentalHealthChatbot: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const { addMessage, messages, healthData } = useDrugContext();

  const getMistralAIResponse = async (userMessage: string) => {
    try {
      setIsWaiting(true);
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_MEDICAL_MODEL || 'mistral-medium',
          messages: [
            { 
              role: 'system', 
              content: `You are a compassionate healthcare assistant specializing in medication and mental health support. 
                       Your role is to provide empathetic guidance about medication concerns, side effects, and 
                       emotional aspects of health management. Never provide specific medical advice or diagnoses.
                       Always encourage speaking with healthcare professionals for medical decisions.
                       ${healthData ? `The user has the following health data: ${JSON.stringify(healthData)}` : ''}`
            },
            ...messages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            })),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Mistral AI');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error with Mistral AI:', error);
      return "I'm having trouble connecting to my knowledge base right now. Could we try again in a moment?";
    } finally {
      setIsWaiting(false);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = message;
      addMessage({ text: userMessage, sender: 'user' });
      setMessage('');
      
      // Get AI response using Mistral
      const aiResponse = await getMistralAIResponse(userMessage);
      addMessage({ text: aiResponse, sender: 'bot' });
    }
  };

  return (
    <div className="mental-health-chatbot">
      <div className="chatbot-header">
        <h3>Mental Health Assistant</h3>
        <p>Powered by Mistral AI</p>
      </div>
      <div className="chatbot-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Talk to our mental health assistant about your medication concerns, side effects, or emotional well-being.</p>
            <p>Example questions:</p>
            <ul>
              <li>"I'm feeling anxious about my new medication"</li>
              <li>"How can I cope with medication side effects?"</li>
              <li>"I'm worried about drug interactions"</li>
            </ul>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-avatar">
                {msg.sender === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.text}</div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        {isWaiting && (
          <div className="message bot typing">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && !isWaiting && handleSendMessage()}
          disabled={isWaiting}
        />
        <button 
          className="send-button" 
          onClick={handleSendMessage}
          disabled={!message.trim() || isWaiting}
        >
          <FaPaperPlane />
        </button>
      </div>
      <div className="chatbot-disclaimer">
        <p>This is an AI assistant and not a substitute for professional mental health advice.</p>
        <p>Powered by Mistral AI</p>
      </div>
    </div>
  );
};

export default MentalHealthChatbot; 