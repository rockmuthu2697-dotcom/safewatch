import React, { useState, useEffect, useRef } from 'react';
import { useSafeWatch } from '../context/SafeWatchContext';
import {
  ShieldAlert,
  AlertTriangle,
  X,
  PhoneCall,
  MessageSquare,
  Navigation,
  Camera,
  CheckCircle2,
  Clock,
  RotateCcw,
  Fingerprint,
  Radio,
  ExternalLink
} from 'lucide-react';
import { playBeep, playSuccessChime } from '../utils/sound';

export default function SosModal({ isOpen, onClose, onRequireAuth }) {
  const {
    emergencyActive,
    currentEmergency,
    triggerEmergency,
    cancelEmergency,
    contacts,
    location,
    lastSnapshot,
    deviceState
  } = useSafeWatch();

  // Press-and-hold state
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdStartTimeRef = useRef(null);
  const holdIntervalRef = useRef(null);

  // Cancellation Grace Countdown state
  const [isGracePeriod, setIsGracePeriod] = useState(false);
  const [graceCountdown, setGraceCountdown] = useState(5);
  const graceTimerRef = useRef(null);

  // Clean up on modal open/close
  useEffect(() => {
    if (!isOpen) {
      stopHold();
      cancelGracePeriod();
    }
  }, [isOpen]);

  const stopHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setHolding(false);
    setHoldProgress(0);
  };

  const startHold = () => {
    if (emergencyActive || isGracePeriod) return;
    setHolding(true);
    setHoldProgress(0);
    holdStartTimeRef.current = Date.now();

    playBeep(440, 0.05);

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progressPct = Math.min(100, (elapsed / 3000) * 100);
      setHoldProgress(progressPct);

      // Play beeps as progress advances
      if (Math.floor(elapsed / 500) > Math.floor((elapsed - 50) / 500)) {
        playBeep(500 + progressPct * 4, 0.04);
      }

      if (elapsed >= 3000) {
        stopHold();
        // 3-second requirement fulfilled -> Start Grace Countdown to prevent accidental alerts
        beginGracePeriod();
      }
    }, 40);
  };

  const beginGracePeriod = () => {
    setIsGracePeriod(true);
    setGraceCountdown(5);
    playBeep(880, 0.15, 'sawtooth');

    graceTimerRef.current = setInterval(() => {
      setGraceCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(graceTimerRef.current);
          graceTimerRef.current = null;
          setIsGracePeriod(false);
          // Confirm emergency dispatch!
          triggerEmergency('Wearable SOS Hard Press (3s Confirmed)');
          return 0;
        }
        playBeep(700, 0.08);
        return prev - 1;
      });
    }, 1000);
  };

  const cancelGracePeriod = () => {
    if (graceTimerRef.current) {
      clearInterval(graceTimerRef.current);
      graceTimerRef.current = null;
    }
    setIsGracePeriod(false);
    setGraceCountdown(5);
  };

  const handleInstantConfirm = () => {
    cancelGracePeriod();
    triggerEmergency('Wearable SOS Hard Press (Instant Confirm)');
  };

  const handleAbortGrace = () => {
    cancelGracePeriod();
    playSuccessChime();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content sos-modal-shell" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <ShieldAlert className="text-rose-500 animate-pulse" size={26} />
            <div>
              <h3>SAFEWATCH Emergency Dispatch Hub</h3>
              <p className="modal-subtitle">Direct Wearable Distress Control System</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* ACTIVE EMERGENCY VIEW */}
        {emergencyActive ? (
          <div className="sos-active-view">
            <div className="emergency-alert-banner">
              <div className="pulse-danger-dot"></div>
              <div>
                <h4>EMERGENCY SOS BROADCAST ACTIVE</h4>
                <p>Distress alert transmitted to {contacts.length} trusted contacts & emergency dispatch desk.</p>
              </div>
            </div>

            {/* Emergency Details / Workflow */}
            <div className="emergency-workflow-timeline">
              <div className="workflow-step completed">
                <div className="step-indicator">
                  <CheckCircle2 size={16} />
                </div>
                <div className="step-content">
                  <div className="step-heading">SOS Trigger Confirmed</div>
                  <div className="step-detail">
                    {currentEmergency?.trigger || 'Hardware SOS Button'} • {new Date(currentEmergency?.timestamp || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="workflow-step completed">
                <div className="step-indicator">
                  <CheckCircle2 size={16} />
                </div>
                <div className="step-content">
                  <div className="step-heading">Live Telemetry & GPS Packaged</div>
                  <div className="step-detail">
                    Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)} ({location.isReal ? 'Real Geolocation' : 'Demo Lab Pin'})
                  </div>
                </div>
              </div>

              <div className="workflow-step completed">
                <div className="step-indicator">
                  <CheckCircle2 size={16} />
                </div>
                <div className="step-content">
                  <div className="step-heading">Auto-Snapshot & Camera Buffer</div>
                  <div className="step-detail">
                    {lastSnapshot ? 'Visual snapshot attached to emergency record' : 'Simulated emergency camera telemetry buffered'}
                  </div>
                </div>
              </div>

              <div className="workflow-step completed">
                <div className="step-indicator">
                  {deviceState.networkStatus === 'offline' ? (
                    <Clock size={16} className="text-amber-400" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                </div>
                <div className="step-content">
                  <div className="step-heading">
                    {deviceState.networkStatus === 'offline' ? 'Offline Queued in Hardware Memory' : 'Simulated Broadcast Dispatched'}
                  </div>
                  <div className="step-detail">
                    {deviceState.networkStatus === 'offline'
                      ? 'No GSM connection. Alert will automatically transmit once network returns!'
                      : 'Simulated SMS, automated emergency call queuing, and map links delivered to contacts.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recipient Contacts Simulated Delivery Status */}
            <div className="recipients-status-panel">
              <div className="panel-subhead">Simulated Contact Notifications:</div>
              <div className="recipient-list">
                {contacts.map((c) => (
                  <div key={c.id} className="recipient-row">
                    <div className="recipient-info">
                      <strong>{c.name}</strong>
                      <span>({c.relation}) • {c.phone}</span>
                    </div>
                    <span className="status-badge success">
                      <MessageSquare size={12} />
                      <span>{deviceState.networkStatus === 'offline' ? 'Queued' : 'SMS Sent'}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stand down button */}
            <div className="active-sos-actions">
              <button
                type="button"
                className="btn-standdown"
                onClick={cancelEmergency}
              >
                <RotateCcw size={16} />
                <span>Deactivate Emergency / Stand Down</span>
              </button>
            </div>
          </div>
        ) : isGracePeriod ? (
          /* GRACE PERIOD COUNTDOWN VIEW (Accidental trigger protection) */
          <div className="sos-grace-view">
            <div className="grace-warning-box">
              <AlertTriangle size={36} className="text-rose-500 animate-bounce" />
              <h3>SOS TRIGGER INITIATED</h3>
              <p>Deliberate 3-second hold completed. Transmitting emergency distress in:</p>
            </div>

            <div className="grace-countdown-display">
              <div className="countdown-number">{graceCountdown}</div>
              <div className="countdown-label">SECONDS TO CANCEL</div>
            </div>

            <p className="grace-subtext">
              Press <strong>"CANCEL ACCIDENTAL ALERT"</strong> now if this was pressed by mistake.
            </p>

            <div className="grace-actions">
              <button
                type="button"
                className="btn-cancel-accidental"
                onClick={handleAbortGrace}
              >
                <X size={20} />
                <span>CANCEL ACCIDENTAL ALERT</span>
              </button>

              <button
                type="button"
                className="btn-instant-confirm"
                onClick={handleInstantConfirm}
              >
                <ShieldAlert size={18} />
                <span>Confirm & Send Immediately</span>
              </button>
            </div>
          </div>
        ) : (
          /* TRIGGER SOS VIEW (3-Second Press & Hold) */
          <div className="sos-trigger-view">
            <div className="sos-instructions-card">
              <div className="instruction-item">
                <span className="num-pill">1</span>
                <span>Press and <strong>HOLD</strong> the button below for <strong>3 seconds</strong>.</span>
              </div>
              <div className="instruction-item">
                <span className="num-pill">2</span>
                <span>A 5-second accidental alert cancellation window will follow.</span>
              </div>
              <div className="instruction-item">
                <span className="num-pill">3</span>
                <span>Telemetry, GPS coordinates, and camera frame will dispatch to trusted contacts.</span>
              </div>
            </div>

            {/* The Big 3-Second Hold SOS Button */}
            <div className="sos-hold-container">
              <div
                className={`sos-hold-btn ${holding ? 'is-holding' : ''}`}
                onMouseDown={startHold}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                onTouchStart={startHold}
                onTouchEnd={stopHold}
                role="button"
                tabIndex={0}
              >
                {/* Circular SVG Progress Ring */}
                <svg className="sos-svg-ring" viewBox="0 0 160 160">
                  <circle
                    className="ring-bg"
                    cx="80"
                    cy="80"
                    r="72"
                    fill="none"
                    stroke="rgba(239, 68, 68, 0.2)"
                    strokeWidth="8"
                  />
                  <circle
                    className="ring-progress"
                    cx="80"
                    cy="80"
                    r="72"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeDasharray={452.4}
                    strokeDashoffset={452.4 - (452.4 * holdProgress) / 100}
                    strokeLinecap="round"
                    transform="rotate(-90 80 80)"
                  />
                </svg>

                <div className="sos-inner-content">
                  <ShieldAlert size={48} className="sos-icon-glow" />
                  <span className="sos-text">SOS</span>
                  <span className="sos-hold-timer">
                    {holding ? `${((holdProgress * 3) / 100).toFixed(1)}s / 3.0s` : 'HOLD 3s'}
                  </span>
                </div>

                <div className="sos-ring-pulse"></div>
              </div>

              <div className="hold-hint">
                {holding ? (
                  <span className="text-rose-400 font-semibold animate-pulse">
                    Keep holding... {Math.round(holdProgress)}%
                  </span>
                ) : (
                  <span>Click and hold mouse or finger down for 3 continuous seconds</span>
                )}
              </div>
            </div>

            {/* Secondary Option: Biometric Test */}
            <div className="biometric-check-footer">
              <button
                type="button"
                className="btn-auth-preview"
                onClick={() => {
                  onClose();
                  onRequireAuth();
                }}
              >
                <Fingerprint size={16} />
                <span>Simulate Wearable Fingerprint Verification</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
