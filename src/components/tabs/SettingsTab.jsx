import React, { useState } from 'react';
import { useSafeWatch } from '../../context/SafeWatchContext';
import {
  Settings,
  ShieldCheck,
  RotateCcw,
  Volume2,
  VolumeX,
  Camera,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  HelpCircle,
  HeartHandshake
} from 'lucide-react';
import { playBeep, playSuccessChime } from '../../utils/sound';

export default function SettingsTab({ onNavigateTab }) {
  const {
    deviceState,
    toggleSound,
    handleResetDemoData,
    showToast
  } = useSafeWatch();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleTestChime = () => {
    playSuccessChime();
    showToast('Audio Chime Tested', 'Testing Web Audio API sound synthesizer.', 'info');
  };

  const handleConfirmReset = () => {
    handleResetDemoData();
    setConfirmResetOpen(false);
  };

  return (
    <div className="tab-pane settings-tab">
      <div className="tab-header-banner">
        <div>
          <h2 className="tab-title">Settings & Prototype Disclaimers</h2>
          <p className="tab-description">
            Demo preferences, transparency disclosure, and data state management.
          </p>
        </div>
      </div>

      {/* Transparency Table: What is Real vs Simulated */}
      <div className="settings-section">
        <div className="section-head-sm">
          <ShieldCheck size={18} className="text-purple-400" />
          <span>Hackathon Transparency: Real vs Simulated Features Matrix</span>
        </div>
        <p className="section-desc">
          To maintain scientific integrity during hackathon judging, the following table clarifies exactly how each feature operates in this web prototype:
        </p>

        <div className="matrix-table-wrap">
          <table className="transparency-table">
            <thead>
              <tr>
                <th>Feature Module</th>
                <th>Implementation Mode</th>
                <th>Technical Behavior in Prototype</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>HTML5 Geolocation</strong></td>
                <td><span className="badge-matrix real">REAL BROWSER API</span></td>
                <td>Requests user permission via <code>navigator.geolocation</code>. If approved, displays genuine GPS latitude, longitude, and accuracy. If denied, seamlessly switches to marked demo coordinates.</td>
              </tr>
              <tr>
                <td><strong>Emergency Camera</strong></td>
                <td><span className="badge-matrix real">REAL BROWSER API</span></td>
                <td>Requests webcam stream via <code>navigator.mediaDevices.getUserMedia</code>. Frames are rendered strictly locally on canvas. Never uploaded or sent to third-party servers.</td>
              </tr>
              <tr>
                <td><strong>Audio Siren Alarm</strong></td>
                <td><span className="badge-matrix real">REAL SYNTHESIZER</span></td>
                <td>Generates synthesized multi-frequency alert sweeps using browser <code>Web Audio API</code> oscillators. No external audio files or downloads needed.</td>
              </tr>
              <tr>
                <td><strong>Data Persistence</strong></td>
                <td><span className="badge-matrix real">REAL BROWSER STORAGE</span></td>
                <td>Saves custom contacts, alert logs, and telemetry states in browser <code>localStorage</code> so updates persist across reloads.</td>
              </tr>
              <tr>
                <td><strong>Fingerprint Biometrics</strong></td>
                <td><span className="badge-matrix sim">SIMULATED DEMO</span></td>
                <td>A visual UI simulation demonstrating the intended wearable authentication flow. No hardware fingerprint reading is claimed or executed.</td>
              </tr>
              <tr>
                <td><strong>Cellular GSM / SMS Dispatch</strong></td>
                <td><span className="badge-matrix sim">SIMULATED DEMO</span></td>
                <td>Simulates packet queueing, carrier latency, and delivery receipts inside the dashboard. No actual cellular charges, SMS, or telephone calls occur.</td>
              </tr>
              <tr>
                <td><strong>Wearable BLE Hardware</strong></td>
                <td><span className="badge-matrix sim">SIMULATED DEMO</span></td>
                <td>Simulated via the interactive Hardware Telemetry Playground (Battery sliders, Network toggles, GPS status buttons).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="settings-section">
        <div className="section-head-sm">
          <Settings size={18} className="text-purple-400" />
          <span>Device Audio & Notification Preferences</span>
        </div>

        <div className="settings-options-grid">
          <div className="settings-card-item">
            <div className="item-info">
              <h4>Emergency Siren Audio</h4>
              <p>Play audible alternating distress siren when SOS mode is activated.</p>
            </div>
            <div className="item-action">
              <button
                onClick={toggleSound}
                className={`btn-toggle-switch ${deviceState.soundEnabled ? 'active' : ''}`}
              >
                {deviceState.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>{deviceState.soundEnabled ? 'Enabled' : 'Muted'}</span>
              </button>
            </div>
          </div>

          <div className="settings-card-item">
            <div className="item-info">
              <h4>Audio Chime Feedback</h4>
              <p>Play short UI clicks and validation feedback beeps.</p>
            </div>
            <div className="item-action">
              <button onClick={handleTestChime} className="btn-secondary">
                Test Audio Chime
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Factory Reset Section */}
      <div className="settings-section danger-zone-section">
        <div className="section-head-sm">
          <AlertTriangle size={18} className="text-rose-400" />
          <span>Factory Reset & Demo Data Reset</span>
        </div>
        <p className="section-desc">
          Restores all demo contacts, initial telemetry states, and clears custom alert logs. Useful when preparing for a new judge presentation.
        </p>

        <div className="reset-action-card">
          <div>
            <h4>Restore Default Demo Environment</h4>
            <p>Resets localStorage and restores initial Team Neuronex demo values.</p>
          </div>
          <button
            onClick={() => setConfirmResetOpen(true)}
            className="btn-danger"
          >
            <RotateCcw size={16} />
            <span>Reset All Demo Data</span>
          </button>
        </div>
      </div>

      {/* Project Credits */}
      <div className="project-credits-card">
        <HeartHandshake size={24} className="text-purple-400 mb-2" />
        <h4>SAFEWATCH – Smart Women Safety Wearable</h4>
        <p className="team-meta">Engineered with ❤️ by <strong>Team Neuronex</strong></p>
        <p className="theme-meta">Theme: Women Safety through Smart Wearables</p>
        <div className="credits-badge-row">
          <span className="credit-pill">React 18 + Vite</span>
          <span className="credit-pill">Web Audio API</span>
          <span className="credit-pill">HTML5 Geolocation</span>
          <span className="credit-pill">OpenStreetMap</span>
          <span className="credit-pill">Local Camera Stream</span>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {confirmResetOpen && (
        <div className="modal-backdrop" onClick={() => setConfirmResetOpen(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon-wrap">
              <AlertTriangle size={36} className="text-rose-400" />
            </div>
            <h3>Reset All Demo Data to Defaults?</h3>
            <p>
              This will reset custom contacts, revert battery & network telemetry, and restore default sample data.
            </p>
            <div className="confirm-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmResetOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmReset}
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
