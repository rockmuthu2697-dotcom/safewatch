import React from 'react';
import { useSafeWatch } from '../context/SafeWatchContext';
import {
  ShieldAlert,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Signal,
  SignalLow,
  WifiOff,
  Navigation,
  Bluetooth,
  Volume2,
  VolumeX,
  Radio,
  BookOpen
} from 'lucide-react';

export default function Header({ onOpenJudgesGuide, onOpenSosModal }) {
  const {
    deviceState,
    toggleSound,
    sirenPlaying,
    emergencyActive
  } = useSafeWatch();

  // Battery helper
  const getBatteryIcon = () => {
    if (deviceState.isCharging) return <BatteryCharging className="text-emerald-400" size={16} />;
    if (deviceState.battery <= 20) return <BatteryWarning className="text-rose-400 animate-pulse" size={16} />;
    return <Battery className={deviceState.battery > 50 ? 'text-emerald-400' : 'text-amber-400'} size={16} />;
  };

  // Signal helper
  const getSignalBadge = () => {
    if (deviceState.networkStatus === '4G') {
      return (
        <span className="telemetry-pill success" title="4G LTE High-speed Network">
          <Signal size={13} />
          <span>4G LTE</span>
        </span>
      );
    }
    if (deviceState.networkStatus === '3G') {
      return (
        <span className="telemetry-pill warning" title="3G Cellular Signal">
          <SignalLow size={13} />
          <span>3G Slow</span>
        </span>
      );
    }
    return (
      <span className="telemetry-pill danger animate-pulse" title="Cellular Offline (Alerts will queue)">
        <WifiOff size={13} />
        <span>No GSM</span>
      </span>
    );
  };

  // GPS helper
  const getGpsBadge = () => {
    if (deviceState.gpsStatus === 'locked') {
      return (
        <span className="telemetry-pill success" title="GPS Locked (<5m precision)">
          <Navigation size={13} />
          <span>GPS Fix</span>
        </span>
      );
    }
    if (deviceState.gpsStatus === 'searching') {
      return (
        <span className="telemetry-pill warning" title="Acquiring Satellites...">
          <Radio size={13} className="animate-spin" />
          <span>GPS Search</span>
        </span>
      );
    }
    return (
      <span className="telemetry-pill danger" title="GPS Unavailable (Using Cached)">
        <Navigation size={13} className="opacity-50" />
        <span>GPS Off</span>
      </span>
    );
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand & Team Info */}
        <div className="brand-group">
          <div className="brand-logo-wrap">
            <ShieldAlert size={28} className="brand-icon" />
            <span className="brand-pulse-ring"></span>
          </div>
          <div className="brand-titles">
            <div className="brand-name-row">
              <span className="brand-name">SAFEWATCH</span>
              <span className="brand-tag">PROTOTYPE</span>
            </div>
            <div className="brand-meta">
              <span className="team-badge">Team Neuronex</span>
              <span className="meta-sep">•</span>
              <span className="meta-theme">Smart Women Safety Wearable</span>
            </div>
          </div>
        </div>

        {/* Live Wearable Telemetry Pill Bar */}
        <div className="telemetry-bar">
          {/* BLE connection */}
          <div
            className={`telemetry-pill ${deviceState.bleConnected ? 'ble-active' : 'ble-inactive'}`}
            title={`Hardware: ${deviceState.deviceId} (${deviceState.firmware})`}
          >
            <Bluetooth size={13} />
            <span>{deviceState.bleConnected ? 'Band Synced' : 'Unpaired'}</span>
          </div>

          {/* Battery */}
          <div
            className={`telemetry-pill ${deviceState.battery <= 20 ? 'danger' : 'neutral'}`}
            title={`Battery: ${deviceState.battery}%`}
          >
            {getBatteryIcon()}
            <span>{deviceState.battery}%</span>
          </div>

          {/* Network */}
          {getSignalBadge()}

          {/* GPS */}
          {getGpsBadge()}

          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            className={`telemetry-btn ${deviceState.soundEnabled ? 'active' : 'muted'}`}
            title={deviceState.soundEnabled ? 'Emergency Siren Sound ON' : 'Emergency Siren Sound Muted'}
          >
            {deviceState.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="header-actions">
          <button
            onClick={onOpenJudgesGuide}
            className="btn-judges-guide"
            title="Open Demo Script for Hackathon Presentation"
          >
            <BookOpen size={16} />
            <span className="guide-btn-text">Judges Demo Guide</span>
          </button>

          <button
            onClick={onOpenSosModal}
            className={`header-sos-btn ${emergencyActive ? 'active-emergency' : ''}`}
          >
            <span className="btn-sos-glow"></span>
            <ShieldAlert size={18} />
            <span>{emergencyActive ? 'EMERGENCY ACTIVE' : 'SOS TRIGGER'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
