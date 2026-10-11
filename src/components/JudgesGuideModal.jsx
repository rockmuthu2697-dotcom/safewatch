import React from 'react';
import {
  BookOpen,
  X,
  CheckCircle2,
  Play,
  ShieldAlert,
  MapPin,
  Camera,
  Users,
  Sliders,
  Sparkles,
  Award
} from 'lucide-react';

export default function JudgesGuideModal({ isOpen, onClose, onNavigateTab, onOpenSosModal, onOpenAuthModal }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content judges-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <Award className="text-amber-400" size={24} />
            <div>
              <h3>Hackathon Presentation Guide & Demo Script</h3>
              <p className="modal-subtitle">Team Neuronex • SAFEWATCH Project Pitch</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="guide-body">
          {/* Elevator Pitch Box */}
          <div className="elevator-pitch-card">
            <div className="pitch-tag">30-SECOND ELEVATOR PITCH FOR JUDGES</div>
            <p className="pitch-text">
              "Respected Judges, women’s safety devices often fail due to accidental triggers, delayed dispatch, or lack of reliable telemetry. 
              <strong> SAFEWATCH by Team Neuronex</strong> is a next-generation smart wearable ecosystem designed for rapid distress communication. 
              Our design features a <strong>deliberate 3-second tactile hold</strong>, an accidental alert grace window, dual-mode <strong>live GNSS coordinate tracking</strong>, 
              local <strong>incident video buffering</strong>, and an <strong>offline retry queue</strong> that stores alerts in memory even when entering a cellular deadzone."
            </p>
          </div>

          {/* Step-by-Step Script */}
          <div className="steps-container">
            <h4>Live Demo Walkthrough Steps:</h4>

            {/* Step 1 */}
            <div className="guide-step-card">
              <div className="step-num-badge">STEP 1</div>
              <div className="step-content">
                <div className="step-title">Wearable Telemetry & Biometric Auth</div>
                <p className="step-talk">
                  <strong>What to say:</strong> "Notice our dark-mode emergency console. We monitor real-time battery, 4G cellular signal, GPS lock, and BLE pairing. Let's verify the wearer identity."
                </p>
                <div className="step-action-row">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuthModal();
                    }}
                    className="btn-script-action"
                  >
                    <Play size={13} />
                    <span>Open Simulated Fingerprint Scanner</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="guide-step-card">
              <div className="step-num-badge">STEP 2</div>
              <div className="step-content">
                <div className="step-title">The 3-Second SOS & Grace Cancellation Window</div>
                <p className="step-talk">
                  <strong>What to say:</strong> "Most false alarms happen because of single accidental clicks. SAFEWATCH requires a deliberate 3-second continuous hold. After that, we provide a 5-second grace window with audible beeps to cancel if triggered by mistake."
                </p>
                <div className="step-action-row">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSosModal();
                    }}
                    className="btn-script-action"
                  >
                    <ShieldAlert size={13} />
                    <span>Launch SOS Press-and-Hold Modal</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="guide-step-card">
              <div className="step-num-badge">STEP 3</div>
              <div className="step-content">
                <div className="step-title">Live Geolocation & Safety Corridors</div>
                <p className="step-talk">
                  <strong>What to say:</strong> "Our prototype features dual-mode tracking: we can request real browser GPS with accuracy radius, or show our hackathon benchmark safety corridor with nearby emergency police booths."
                </p>
                <div className="step-action-row">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTab('location');
                    }}
                    className="btn-script-action"
                  >
                    <MapPin size={13} />
                    <span>Open Location Tab</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="guide-step-card">
              <div className="step-num-badge">STEP 4</div>
              <div className="step-content">
                <div className="step-title">Emergency Video & Local Privacy</div>
                <p className="step-talk">
                  <strong>What to say:</strong> "During an incident, capturing visual evidence is critical. SAFEWATCH can capture local webcam snapshots or run an animated night-vision HUD. Most importantly, all imagery remains 100% on-device for user privacy."
                </p>
                <div className="step-action-row">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTab('camera');
                    }}
                    className="btn-script-action"
                  >
                    <Camera size={13} />
                    <span>Open Emergency Video Tab</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="guide-step-card">
              <div className="step-num-badge">STEP 5</div>
              <div className="step-content">
                <div className="step-title">Hardware Deadzone Simulation & Auto-Retry Queue</div>
                <p className="step-talk">
                  <strong>What to say:</strong> "What happens if an attack occurs in a basement with no cellular signal? Watch our Hardware Simulator: if we switch to 'Offline' and trigger SOS, the alert is stored in hardware flash memory. As soon as the carrier signal returns to 4G, it auto-dispatches!"
                </p>
                <div className="step-action-row">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTab('device');
                    }}
                    className="btn-script-action"
                  >
                    <Sliders size={13} />
                    <span>Open Hardware Simulator</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions-footer">
          <button type="button" className="btn-primary-purple" onClick={onClose}>
            Got it, Let's Present!
          </button>
        </div>
      </div>
    </div>
  );
}
