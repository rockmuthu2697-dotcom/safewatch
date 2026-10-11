import React, { useState, useRef, useEffect } from 'react';
import { useSafeWatch } from '../../context/SafeWatchContext';
import {
  Camera,
  Video,
  VideoOff,
  Disc,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Download,
  Trash2,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { playBeep, playSuccessChime } from '../../utils/sound';

export default function CameraTab() {
  const {
    lastSnapshot,
    setLastSnapshot,
    cameraActive,
    setCameraActive,
    cameraIsReal,
    setCameraIsReal,
    showToast
  } = useSafeWatch();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const simCanvasRef = useRef(null);

  const [simActive, setSimActive] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [recordingSim, setRecordingSim] = useState(false);
  const [simFilter, setSimFilter] = useState('standard'); // 'standard' | 'night' | 'thermal'

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      stopRealCamera();
    };
  }, []);

  // Simulated Camera Canvas Animation
  useEffect(() => {
    let animId;
    if (simActive && simCanvasRef.current) {
      const canvas = simCanvasRef.current;
      const ctx = canvas.getContext('2d');
      let angle = 0;

      const renderSim = () => {
        angle += 0.03;
        const w = canvas.width;
        const h = canvas.height;

        // Background color based on mode
        if (simFilter === 'night') {
          ctx.fillStyle = '#05180f';
        } else if (simFilter === 'thermal') {
          ctx.fillStyle = '#1e052a';
        } else {
          ctx.fillStyle = '#0c1022';
        }
        ctx.fillRect(0, 0, w, h);

        // Grid lines
        ctx.strokeStyle = simFilter === 'night' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(168, 85, 247, 0.15)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Simulated Subject Silhouette / Face Box
        const cx = w / 2 + Math.sin(angle) * 20;
        const cy = h / 2 + Math.cos(angle * 0.7) * 15;

        // Face Detection Bracket
        ctx.strokeStyle = simFilter === 'night' ? '#4ade80' : '#c084fc';
        ctx.lineWidth = 2;
        const boxSize = 110;
        ctx.strokeRect(cx - boxSize / 2, cy - boxSize / 2, boxSize, boxSize);

        // Bracket corners
        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(`SUBJECT_LOCK: [98.4%]`, cx - boxSize / 2, cy - boxSize / 2 - 8);

        // Crosshair center
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.stroke();

        // Watermark Banner
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, h - 35, w, 35);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('⚠️ DEMO SIMULATION: WEARABLE ON-BOARD CAMERA FEED', 15, h - 13);

        // Timestamp overlay
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px "JetBrains Mono", monospace';
        const now = new Date().toISOString();
        ctx.fillText(`REC: ${now}`, 15, 24);

        animId = requestAnimationFrame(renderSim);
      };

      animId = requestAnimationFrame(renderSim);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [simActive, simFilter]);

  // Request Real Camera Permission
  const startRealCamera = async () => {
    setPermissionError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setCameraIsReal(true);
      setSimActive(false);
      showToast('Real Camera Initialized', 'Local webcam connected. Video is processed strictly in your browser.', 'success');
      playSuccessChime();
    } catch (err) {
      console.warn('Camera access denied or failed:', err);
      let msg = 'Could not access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Falling back to the high-tech simulated camera preview.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No physical webcam was detected on this device. Using simulation.';
      } else {
        msg = err.message || 'Camera failed to start. Using simulation.';
      }
      setPermissionError(msg);
      showToast('Camera Permission / Fallback', msg, 'info');
      // Auto-fallback to simulation
      startSimCamera();
    }
  };

  const stopRealCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraIsReal(false);
  };

  const startSimCamera = () => {
    stopRealCamera();
    setSimActive(true);
    setCameraActive(true);
    setCameraIsReal(false);
    showToast('Simulation Camera Ready', 'Displaying wearable night-vision optical simulator.', 'info');
    playBeep(650, 0.08);
  };

  const stopAllCameras = () => {
    stopRealCamera();
    setSimActive(false);
  };

  // Capture Snapshot
  const captureSnapshot = () => {
    playBeep(1200, 0.1);

    if (cameraIsReal && videoRef.current) {
      // Capture from real video
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Add emergency timestamp banner
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`SAFEWATCH EMERGENCY SNAPSHOT • ${new Date().toLocaleString()}`, 10, canvas.height - 10);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setLastSnapshot(dataUrl);
      showToast('Snapshot Captured', 'Local camera frame saved to emergency incident buffer.', 'success');
      playSuccessChime();
    } else if (simActive && simCanvasRef.current) {
      // Capture from simulated canvas
      const canvas = simCanvasRef.current;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setLastSnapshot(dataUrl);
      showToast('Demo Snapshot Captured', 'Simulated camera frame saved to alert records.', 'success');
      playSuccessChime();
    } else {
      showToast('No Active Camera', 'Please start either Real Camera or Simulated Camera first.', 'warning');
    }
  };

  const clearSnapshot = () => {
    setLastSnapshot(null);
    showToast('Snapshot Cleared', 'Incident snapshot buffer emptied.', 'info');
  };

  return (
    <div className="tab-pane camera-tab">
      <div className="tab-header-banner">
        <div>
          <h2 className="tab-title">Emergency Video & Discreet Lens</h2>
          <p className="tab-description">
            Dual-capability optical module: Real HTML5 browser webcam or animated wearable sensor simulation.
          </p>
        </div>
        <div className="tab-header-actions">
          {!cameraActive ? (
            <>
              <button onClick={startRealCamera} className="btn-primary-purple">
                <Video size={16} />
                <span>Request Real Camera Access</span>
              </button>
              <button onClick={startSimCamera} className="btn-secondary">
                <Eye size={16} />
                <span>Use Simulated Camera</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={captureSnapshot} className="btn-capture">
                <Disc size={16} />
                <span>Capture Snapshot Frame</span>
              </button>
              <button onClick={stopAllCameras} className="btn-danger-outline">
                <VideoOff size={16} />
                <span>Stop Camera</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Permission & Privacy Status Bar */}
      <div
        className={`location-status-bar ${
          cameraIsReal ? 'status-real' : simActive ? 'status-sample' : 'status-idle'
        }`}
      >
        <div className="status-indicator-flex">
          {cameraIsReal ? (
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={20} className="text-amber-400 shrink-0" />
          )}
          <div>
            <strong>
              {cameraIsReal
                ? 'REAL BROWSER CAMERA ACTIVE:'
                : simActive
                ? 'WEARABLE SENSOR SIMULATOR ACTIVE:'
                : 'CAMERA IN STANDBY:'}
            </strong>{' '}
            {cameraIsReal
              ? 'Webcam video stream is running locally inside your browser. No video is ever recorded to external servers.'
              : simActive
              ? 'This simulated visual HUD demonstrates how the physical wearable device captures incident imagery during an SOS alert.'
              : 'Click "Request Real Camera Access" to test with your actual webcam, or "Use Simulated Camera" for an instant mock preview.'}
          </div>
        </div>
      </div>

      {/* Error / Fallback alert message */}
      {permissionError && (
        <div className="location-error-alert">
          <AlertCircle size={16} />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Main Viewport Shell */}
      <div className="camera-viewport-shell">
        <div className="camera-toolbar">
          <div className="camera-toolbar-left">
            <span className={`live-record-indicator ${cameraActive ? 'is-live' : ''}`}>
              <span className="dot"></span>
              {cameraActive ? (cameraIsReal ? 'LIVE WEBCAM' : 'SIMULATED FEED') : 'STANDBY'}
            </span>
            <span className="codec-tag">LOCAL STREAM ONLY</span>
          </div>

          {simActive && (
            <div className="filter-select-group">
              <span className="filter-label">Sensor Mode:</span>
              <button
                className={`filter-btn ${simFilter === 'standard' ? 'active' : ''}`}
                onClick={() => setSimFilter('standard')}
              >
                Optical
              </button>
              <button
                className={`filter-btn ${simFilter === 'night' ? 'active' : ''}`}
                onClick={() => setSimFilter('night')}
              >
                Night Vision
              </button>
              <button
                className={`filter-btn ${simFilter === 'thermal' ? 'active' : ''}`}
                onClick={() => setSimFilter('thermal')}
              >
                Thermal HUD
              </button>
            </div>
          )}
        </div>

        {/* Video / Canvas Viewport */}
        <div className="camera-display-box">
          {cameraIsReal ? (
            <div className="real-video-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="webcam-video-element"
              ></video>
              <div className="camera-hud-brackets">
                <div className="bracket top-left"></div>
                <div className="bracket top-right"></div>
                <div className="bracket bottom-left"></div>
                <div className="bracket bottom-right"></div>
                <div className="hud-label font-mono">
                  WEBCAM SENSOR // 1080p // FPS: 30
                </div>
              </div>
            </div>
          ) : simActive ? (
            <div className="sim-canvas-wrapper">
              <canvas
                ref={simCanvasRef}
                width={800}
                height={450}
                className="sim-canvas-element"
              ></canvas>
            </div>
          ) : (
            <div className="camera-idle-placeholder">
              <Camera size={56} className="text-purple-400 opacity-50 mb-3" />
              <h3>Emergency Camera Standby</h3>
              <p>
                In an actual SAFEWATCH wearable, triggering SOS automatically powers the covert micro-lens to capture incident visual evidence.
              </p>
              <div className="idle-actions-row">
                <button onClick={startRealCamera} className="btn-primary-purple">
                  <Video size={16} />
                  <span>Test Real Webcam</span>
                </button>
                <button onClick={startSimCamera} className="btn-secondary">
                  <Eye size={16} />
                  <span>Launch Simulator</span>
                </button>
              </div>
            </div>
          )}

          {/* Hidden Canvas for Real Webcam Frame Grabs */}
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>

        {/* Action Bar Below Video */}
        {cameraActive && (
          <div className="camera-bottom-controls">
            <button onClick={captureSnapshot} className="btn-capture-big">
              <Disc size={20} />
              <span>CAPTURE INCIDENT SNAPSHOT</span>
            </button>
          </div>
        )}
      </div>

      {/* Captured Snapshot Preview Gallery */}
      <div className="snapshot-gallery-section">
        <div className="gallery-header">
          <div>
            <h4>Incident Visual Buffer</h4>
            <p>Snapshots captured are attached to the emergency dispatch record</p>
          </div>
          {lastSnapshot && (
            <button onClick={clearSnapshot} className="btn-ghost-danger">
              <Trash2 size={14} />
              <span>Clear Snapshot</span>
            </button>
          )}
        </div>

        {lastSnapshot ? (
          <div className="snapshot-card">
            <img src={lastSnapshot} alt="Incident Snapshot" className="snapshot-full-img" />
            <div className="snapshot-meta">
              <div className="meta-left">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Captured & buffered locally</span>
              </div>
              <a
                href={lastSnapshot}
                download="safewatch-emergency-snapshot.jpg"
                className="btn-download-snapshot"
              >
                <Download size={13} />
                <span>Download Image</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="empty-snapshot-box">
            <span>No incident snapshots captured yet. Start the camera and click "Capture Snapshot".</span>
          </div>
        )}
      </div>

      {/* Privacy Notice Box */}
      <div className="privacy-security-callout">
        <ShieldCheck size={20} className="text-purple-400 shrink-0" />
        <div>
          <h4>Prototype Privacy Guarantee</h4>
          <p>
            This demo application runs purely client-side. No images, video streams, or audio are ever uploaded, recorded, or transmitted to any external cloud API or third-party server.
          </p>
        </div>
      </div>
    </div>
  );
}
