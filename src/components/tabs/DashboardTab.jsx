import React from 'react';
import { useSafeWatch } from '../../context/SafeWatchContext';
import {
  ShieldAlert,
  ShieldCheck,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Signal,
  WifiOff,
  Navigation,
  Bluetooth,
  Users,
  Camera,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function DashboardTab({ onNavigateTab, onOpenSosModal }) {
  const {
    deviceState,
    location,
    contacts,
    alerts,
    lastSnapshot,
    pendingQueue,
    emergencyActive
  } = useSafeWatch();

  return (
    <div className="tab-pane dashboard-tab">
      {/* Hero Status Card */}
      <div className={`hero-banner ${emergencyActive ? 'hero-emergency' : 'hero-normal'}`}>
        <div className="hero-content">
          <div className="hero-badge-row">
            <span className={`status-pill ${emergencyActive ? 'pill-danger' : 'pill-success'}`}>
              <span className="pill-dot"></span>
              {emergencyActive ? 'CRITICAL DISTRESS ACTIVE' : 'SYSTEM ARMED & MONITORING'}
            </span>
            <span className="demo-indicator-pill">Simulated Hardware Link</span>
          </div>

          <h2 className="hero-title">
            {emergencyActive
              ? 'Emergency Alert Broadcast in Progress'
              : 'SAFEWATCH Wearable Protection Online'}
          </h2>
          <p className="hero-desc">
            {emergencyActive
              ? `SOS packet broadcasted to ${contacts.length} trusted contacts. Emergency siren sounding.`
              : 'Wearable biometric triggers, GPS tracking, and instant distress dispatch are active and ready.'}
          </p>

          <div className="hero-actions">
            <button
              onClick={onOpenSosModal}
              className={`hero-primary-btn ${emergencyActive ? 'btn-danger-glow' : 'btn-purple-glow'}`}
            >
              <ShieldAlert size={18} />
              <span>{emergencyActive ? 'VIEW EMERGENCY TIMELINE' : 'ACTIVATE SOS (3s HOLD)'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('device')}
              className="hero-secondary-btn"
            >
              <Sliders size={16} />
              <span>Hardware Simulator</span>
            </button>
          </div>
        </div>

        {/* Pending Offline Queue Alert */}
        {pendingQueue.length > 0 && (
          <div className="hero-warning-banner">
            <AlertTriangle size={16} />
            <span>
              <strong>{pendingQueue.length} Alert(s) Queued:</strong> Waiting for cellular reconnect to auto-dispatch.
            </span>
          </div>
        )}
      </div>

      {/* Telemetry Grid (Simulated Hardware Statuses) */}
      <div className="section-title-row">
        <div>
          <h3 className="section-heading">Wearable Telemetry & Health</h3>
          <p className="section-subtext">Real-time simulated telemetry from SAFEWATCH Smart Band</p>
        </div>
        <button
          onClick={() => onNavigateTab('device')}
          className="link-button"
        >
          <span>Configure Sim Telemetry</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="telemetry-grid">
        {/* Battery Card */}
        <div className="telemetry-card">
          <div className="card-top">
            <span className="card-label">Battery Level</span>
            <span className="badge-hardware">Simulated Sensor</span>
          </div>
          <div className="card-main">
            <div className="card-metric-row">
              {deviceState.isCharging ? (
                <BatteryCharging className="text-emerald-400" size={28} />
              ) : deviceState.battery <= 20 ? (
                <BatteryWarning className="text-rose-400 animate-pulse" size={28} />
              ) : (
                <Battery className={deviceState.battery > 50 ? 'text-emerald-400' : 'text-amber-400'} size={28} />
              )}
              <span className="metric-number">{deviceState.battery}%</span>
            </div>
            <div className="metric-detail">
              {deviceState.isCharging
                ? 'Rapid Magnetic Charging'
                : deviceState.battery <= 20
                ? 'Low Battery Warning (<20%)'
                : 'Approx. 28h Standby Remaining'}
            </div>
          </div>
          <div className="card-progress">
            <div
              className={`progress-fill ${deviceState.battery <= 20 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${deviceState.battery}%` }}
            ></div>
          </div>
        </div>

        {/* Cellular / Network Card */}
        <div className="telemetry-card">
          <div className="card-top">
            <span className="card-label">Cellular Link</span>
            <span className="badge-hardware">GSM / LTE</span>
          </div>
          <div className="card-main">
            <div className="card-metric-row">
              {deviceState.networkStatus === 'offline' ? (
                <WifiOff className="text-rose-400" size={28} />
              ) : (
                <Signal className="text-emerald-400" size={28} />
              )}
              <span className="metric-number">{deviceState.networkStatus.toUpperCase()}</span>
            </div>
            <div className="metric-detail">
              {deviceState.networkStatus === 'offline'
                ? 'No GSM Signal (Alerts Queueing)'
                : deviceState.networkStatus === '3G'
                ? 'Weak 3G Cellular Tower Handshake'
                : 'Connected to High-Speed 4G VoLTE'}
            </div>
          </div>
          <div className="card-subnote">
            {pendingQueue.length > 0 ? `${pendingQueue.length} alert(s) waiting for carrier signal` : 'SMS & Call Gateway Online'}
          </div>
        </div>

        {/* GPS Card */}
        <div className="telemetry-card">
          <div className="card-top">
            <span className="card-label">GPS Satellites</span>
            <span className="badge-hardware">GNSS / BeiDou</span>
          </div>
          <div className="card-main">
            <div className="card-metric-row">
              <Navigation className={deviceState.gpsStatus === 'locked' ? 'text-cyan-400' : 'text-amber-400'} size={28} />
              <span className="metric-number">{deviceState.gpsStatus === 'locked' ? '3D Lock' : 'Searching'}</span>
            </div>
            <div className="metric-detail">
              {location.isReal
                ? `Browser GPS (±${location.accuracy}m)`
                : 'Simulated Lab Bench Coordinates'}
            </div>
          </div>
          <div className="card-subnote font-mono text-xs">
            {location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E
          </div>
        </div>

        {/* BLE Wearable Status */}
        <div className="telemetry-card">
          <div className="card-top">
            <span className="card-label">Wristband Pairing</span>
            <span className="badge-hardware">BLE 5.3</span>
          </div>
          <div className="card-main">
            <div className="card-metric-row">
              <Bluetooth className={deviceState.bleConnected ? 'text-purple-400' : 'text-slate-500'} size={28} />
              <span className="metric-number">{deviceState.bleConnected ? 'Paired' : 'Uncoupled'}</span>
            </div>
            <div className="metric-detail">
              {deviceState.bleConnected ? deviceState.deviceId : 'Signal out of range'}
            </div>
          </div>
          <div className="card-subnote text-xs">
            Firmware: {deviceState.firmware}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Location & Camera Quick Preview + Contacts & Alerts */}
      <div className="dashboard-columns-grid">
        {/* Left Column: Quick Map & Camera */}
        <div className="dash-col">
          {/* Location Quick Preview */}
          <div className="dash-card">
            <div className="card-header-flex">
              <div className="card-header-title">
                <MapPin className="text-cyan-400" size={18} />
                <h4>Live Location Monitor</h4>
              </div>
              <button
                onClick={() => onNavigateTab('location')}
                className="btn-card-action"
              >
                <span>Full Map</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="dash-location-preview">
              <div className="coords-row">
                <span className="coords-tag">
                  {location.isReal ? 'Real Geolocation' : 'Demo Lab Coordinates'}
                </span>
                <span className="coords-text font-mono">
                  {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E
                </span>
              </div>
              <p className="location-address-text">{location.address}</p>

              <div className="location-quick-btns">
                <a
                  href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-mini-link"
                >
                  <ExternalLink size={12} />
                  <span>Google Maps</span>
                </a>
                <button
                  onClick={() => onNavigateTab('location')}
                  className="btn-mini-primary"
                >
                  Request Real GPS
                </button>
              </div>
            </div>
          </div>

          {/* Camera Quick Preview */}
          <div className="dash-card">
            <div className="card-header-flex">
              <div className="card-header-title">
                <Camera className="text-purple-400" size={18} />
                <h4>Emergency Video & Snapshot</h4>
              </div>
              <button
                onClick={() => onNavigateTab('camera')}
                className="btn-card-action"
              >
                <span>Launch Camera</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="dash-camera-preview">
              {lastSnapshot ? (
                <div className="snapshot-preview-box">
                  <img src={lastSnapshot} alt="Last Snapshot" className="snapshot-img" />
                  <span className="snapshot-time-tag">Snapshot Captured</span>
                </div>
              ) : (
                <div className="camera-placeholder-hud">
                  <Camera size={32} className="text-purple-300 opacity-60" />
                  <p>Webcam / Night-Vision HUD ready for recording</p>
                  <button
                    onClick={() => onNavigateTab('camera')}
                    className="btn-mini-primary"
                  >
                    Open Camera Panel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Trusted Contacts & Recent Alerts */}
        <div className="dash-col">
          {/* Trusted Contacts Mini Card */}
          <div className="dash-card">
            <div className="card-header-flex">
              <div className="card-header-title">
                <Users className="text-pink-400" size={18} />
                <h4>Trusted Contacts ({contacts.length})</h4>
              </div>
              <button
                onClick={() => onNavigateTab('contacts')}
                className="btn-card-action"
              >
                <span>Manage</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="contacts-mini-list">
              {contacts.slice(0, 3).map((c) => (
                <div key={c.id} className="contact-mini-row">
                  <div className="contact-avatar">
                    {c.name.charAt(0)}
                  </div>
                  <div className="contact-mini-details">
                    <div className="contact-mini-name">{c.name}</div>
                    <div className="contact-mini-meta">
                      {c.relation} • {c.phone}
                    </div>
                  </div>
                  <span className="contact-priority-tag">P{c.priority}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts / Activity Log */}
          <div className="dash-card">
            <div className="card-header-flex">
              <div className="card-header-title">
                <Clock className="text-amber-400" size={18} />
                <h4>Recent System Activity</h4>
              </div>
              <button
                onClick={() => onNavigateTab('history')}
                className="btn-card-action"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="activity-mini-list">
              {alerts.length === 0 ? (
                <div className="empty-mini-text">No alerts recorded yet.</div>
              ) : (
                alerts.slice(0, 3).map((a) => (
                  <div key={a.id} className="activity-mini-item">
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <div className="activity-title-row">
                        <span className="activity-title">{a.type}</span>
                        <span className="activity-time">
                          {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="activity-notes">{a.notes}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
