// ============================================================
// components/ApiKeyInput.js
// Modal for user to input their API key when needed
// ============================================================

import React, { useState } from "react";
import "./ApiKeyInput.css";

export default function ApiKeyInput({ isOpen, onClose, onSubmit, error }) {
  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(apiKey.trim());
      setApiKey("");
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="api-key-modal-overlay">
      <div className="api-key-modal">
        <div className="api-key-header">
          <h2>API Key Required</h2>
          <button className="api-key-close" onClick={onClose}>×</button>
        </div>
        
        <div className="api-key-content">
          <p>
            To continue with the interview, please provide your Oxlo AI API key.
          </p>
          <div className="api-key-info">
            <p>
              <strong>Get your API key:</strong><br/>
              1. Visit <a href="https://oxlo.ai" target="_blank" rel="noopener noreferrer">oxlo.ai</a><br/>
              2. Sign up and get your API key<br/>
              3. Copy and paste it below
            </p>
          </div>
          
          {error && (
            <div className="api-key-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="api-key-form">
            <div className="api-key-input-group">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Oxlo AI API key"
                className="api-key-input"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            
            <div className="api-key-actions">
              <button
                type="button"
                onClick={onClose}
                className="api-key-btn api-key-btn-cancel"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="api-key-btn api-key-btn-submit"
                disabled={isSubmitting || !apiKey.trim()}
              >
                {isSubmitting ? "Validating..." : "Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
