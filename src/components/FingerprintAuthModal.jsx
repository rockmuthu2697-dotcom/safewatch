import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle2, AlertCircle, ShieldCheck, X } from 'lucide-react';
import { playBeep, playSuccessChime } from '../utils/sound';

export default function FingerprintAuthModal({ isOpen, onClose, onVerified }) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setScanning(false);
      setProgress(0);
      setVerified(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartScan = () => {
    if (scanning || verified) return;
    setScanning(true);
    setProgress(0);
    playBeep(520, 0.08);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          setVerified(true);
          playSuccessChime();
          setTimeout(() => {
            onVerified();
          }, 800);
          return 100;
        }
        playBeep(600 + prev * 3, 0.04);
        return prev + 10;
      });
    }, 100);
  };

  const handleQuickBypass = () => {
    setVerified(true);
    playSuccessChime();
    setTimeout(() => {
      onVerified();
    }, 400);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <Fingerprint className="text-purple-400" size={24} />
            <div>
              <h3>Wearable Biometric Verification</h3>
              <p className="modal-subtitle">Owner Authentication Protocol</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Clear Prototype Disclaimer */}
        <div className="disclaimer-banner">
          <AlertCircle size={16} className="text-amber-400 shrink-0" />
          <div>
            <strong>PROTOTYPE DEMO SIMULATION:</strong> This simulates the hardware fingerprint sensor on the SAFEWATCH wristband. No actual biometric hardware scanning is performed.
          </div>
        </div>

        <div className="auth-body">
          <div
            className={`fingerprint-sensor-zone ${scanning ? 'is-scanning' : ''} ${verified ? 'is-verified' : ''}`}
            onClick={handleStartScan}
            role="button"
            tabIndex={0}
            title="Click or touch to simulate fingerprint scan"
          >
            <div className="scanner-laser-line"></div>
            {verified ? (
              <CheckCircle2 size={72} className="text-emerald-400 sensor-icon" />
            ) : (
              <Fingerprint size={72} className="sensor-icon text-purple-400" />
            )}
            <div className="scanner-glow-ring"></div>
          </div>

          <div className="auth-instructions">
            {verified ? (
              <div className="auth-status-text success">
                <ShieldCheck size={18} />
                <span>Identity Authenticated: Verified Wearer</span>
              </div>
            ) : scanning ? (
              <div className="auth-status-text scanning">
                <span>Scanning sensor capacitive ridges... {progress}%</span>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            ) : (
              <div className="auth-status-text idle">
                <p>Click the sensor above to simulate placing your registered finger on the wearable module.</p>
              </div>
            )}
          </div>

          <div className="auth-action-buttons">
            {!verified && (
              <button
                type="button"
                className="btn-primary-purple w-full"
                onClick={handleStartScan}
                disabled={scanning}
              >
                {scanning ? 'Reading Sensor...' : 'Touch Sensor to Authenticate'}
              </button>
            )}

            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={handleQuickBypass}
            >
              Skip / Auto-Verify for Demo Presentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
