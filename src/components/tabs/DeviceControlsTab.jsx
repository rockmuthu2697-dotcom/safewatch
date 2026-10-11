import React from 'react';
import { useSafeWatch } from '../../context/SafeWatchContext';
import {
  Sliders,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Signal,
  SignalLow,
  WifiOff,
  Navigation,
  Radio,
  Bluetooth,
  ShieldAlert,
  Camera,
  Activity,
  AlertTriangle,
  RotateCcw,
  Zap,
  Clock,
  Send
} from 'lucide-react';
import { playBeep, playSuccessChime } from '../../utils/sound';

export default function DeviceControlsTab({ onNavigateTab }) {
  const {
    deviceState,
    setBattery,
    setNetworkStatus,
    setGpsStatus,
    toggleBleConnected,
    triggerEmergency,
    pendingQueue,
    location,
    showToast
  } = useSafeWatch();

  // Hardware button simulations
  const handleSimulateHardwareSos = () => {
    playBeep(920, 0.2, 'sawtooth');
    triggerEmergency('Wearable Hardware Crown Long-Press (Physical Button)');
    showToast('Hardware Crown Pressed', 'Wearable physical tactile button triggered distress signal.', 'error');
  };

  const handleSimulateHardwareCamera = () => {
    playBeep(750, 0.1);
    showToast('Wearable Covert Lens Triggered', 'Simulated double-click on hardware optical sensor initiated capture.', 'info');
    onNavigateTab('camera');
  };

  const handleSimulateHapticBuzz = () => {
    playBeep(220, 0.15, 'triangle');
    setTimeout(() => playBeep(220, 0.15, 'triangle'), 180);
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([150, 100, 150]);
      } catch (e) {
        // vibration API might be blocked on non-mobile
      }
    }
    showToast('Haptic Pulse Sent', 'Wearable motor pulsed: [Buzz - Buzz]. Covert safety handshake confirmed.', 'success');
  };

  return (
    <div className="tab-pane device-tab">
      <div className="tab-header-banner">
        <div>
          <h2 className="tab-title">Wearable Hardware & Telemetry Simulator</h2>
          <p className="tab-description">
            Interactive controls to simulate physical wearable hardware inputs, battery states, carrier deadzones, and GPS blindspots.
          </p>
        </div>
      </div>

      {/* 3 Conceptual Physical Controls */}
      <div className="hardware-section">
        <div className="section-head-sm">
          <Activity size={18} className="text-purple-400" />
          <span>Conceptual Physical Wearable Controls (SAFEWATCH Smart Band)</span>
        </div>
        <p className="section-desc">
          In the physical wearable device, these actions correspond to physical crown presses and discreet sensor gestures:
        </p>

        <div className="physical-controls-grid">
          {/* Physical Control 1: SOS Crown */}
          <div className="hardware-action-card">
            <div className="action-card-header">
              <ShieldAlert size={22} className="text-rose-500" />
              <div>
                <h4>Tactile Crown Long-Press</h4>
                <span className="action-type-tag">Primary Emergency Trigger</span>
              </div>
            </div>
            <p className="action-desc">
              Wearer presses and holds the recessed physical crown on the band for 3 seconds to trigger emergency broadcast without looking.
            </p>
            <button
              onClick={handleSimulateHardwareSos}
              className="btn-hw-trigger btn-hw-danger"
            >
              Simulate Crown Long-Press
            </button>
          </div>

          {/* Physical Control 2: Camera / Optical Double Click */}
          <div className="hardware-action-card">
            <div className="action-card-header">
              <Camera size={22} className="text-purple-400" />
              <div>
                <h4>Discreet Lens Double-Tap</h4>
                <span className="action-type-tag">Optical Buffer Trigger</span>
              </div>
            </div>
            <p className="action-desc">
              A rapid double-tap on the wristband's capacitive bezel quietly awakens the camera module and captures an incident snapshot.
            </p>
            <button
              onClick={handleSimulateHardwareCamera}
              className="btn-hw-trigger btn-hw-purple"
            >
              Simulate Bezel Double-Tap
            </button>
          </div>

          {/* Physical Control 3: Haptic Heartbeat */}
          <div className="hardware-action-card">
            <div className="action-card-header">
              <Zap size={22} className="text-cyan-400" />
              <div>
                <h4>Silent Haptic Heartbeat</h4>
                <span className="action-type-tag">Covert Sensory Check</span>
              </div>
            </div>
            <p className="action-desc">
              Sends an inaudible tactile dual-pulse vibration to the user's wrist confirming the safety network is active without alerting bystanders.
            </p>
            <button
              onClick={handleSimulateHapticBuzz}
              className="btn-hw-trigger btn-hw-cyan"
            >
              Simulate Haptic Buzz
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Telemetry Simulators */}
      <div className="simulators-grid">
        {/* Battery Simulator */}
        <div className="sim-control-card">
          <div className="sim-card-top">
            <div className="sim-title-row">
              {deviceState.battery <= 20 ? (
                <BatteryWarning className="text-rose-400 animate-pulse" size={22} />
              ) : (
                <Battery className="text-emerald-400" size={22} />
              )}
              <div>
                <h4>Battery Level Simulator</h4>
                <span className="sim-state-text">Current: {deviceState.battery}%</span>
              </div>
            </div>
            <span className={`badge-state ${deviceState.battery <= 20 ? 'danger' : 'normal'}`}>
              {deviceState.battery <= 20 ? 'LOW BATTERY WARNING' : 'NORMAL'}
            </span>
          </div>

          <div className="sim-slider-wrap">
            <input
              type="range"
              min="0"
              max="100"
              value={deviceState.battery}
              onChange={(e) => setBattery(e.target.value)}
              className="sim-range-slider"
            />
            <div className="slider-ticks">
              <span>0%</span>
              <span className="text-rose-400">20% (Warning)</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {deviceState.battery <= 20 && (
            <div className="sim-warning-banner">
              <AlertTriangle size={15} />
              <span>Low-battery threshold tripped! Wearable power-saver activated.</span>
            </div>
          )}

          <div className="sim-presets-row">
            <button onClick={() => setBattery(95)} className="btn-preset">
              Normal (95%)
            </button>
            <button onClick={() => setBattery(15)} className="btn-preset text-rose-400">
              Low Warning (15%)
            </button>
            <button onClick={() => setBattery(4)} className="btn-preset text-rose-500">
              Critical (4%)
            </button>
          </div>
        </div>

        {/* Network & Offline Queue Simulator */}
        <div className="sim-control-card">
          <div className="sim-card-top">
            <div className="sim-title-row">
              {deviceState.networkStatus === 'offline' ? (
                <WifiOff className="text-rose-400 animate-pulse" size={22} />
              ) : deviceState.networkStatus === '3G' ? (
                <SignalLow className="text-amber-400" size={22} />
              ) : (
                <Signal className="text-emerald-400" size={22} />
              )}
              <div>
                <h4>Cellular Network Simulator</h4>
                <span className="sim-state-text">Status: {deviceState.networkStatus.toUpperCase()}</span>
              </div>
            </div>
            <span
              className={`badge-state ${
                deviceState.networkStatus === 'offline'
                  ? 'danger'
                  : deviceState.networkStatus === '3G'
                  ? 'warning'
                  : 'normal'
              }`}
            >
              {deviceState.networkStatus === 'offline'
                ? 'DEADZONE (OFFLINE)'
                : deviceState.networkStatus === '3G'
                ? 'WEAK 3G'
                : '4G LTE'}
            </span>
          </div>

          <p className="sim-explain-text">
            Toggle network to test offline alert queueing and automated retry upon reconnection:
          </p>

          <div className="sim-toggle-row">
            <button
              onClick={() => setNetworkStatus('4G')}
              className={`btn-net-toggle ${deviceState.networkStatus === '4G' ? 'active-4g' : ''}`}
            >
              <Signal size={15} />
              <span>4G LTE (Normal)</span>
            </button>
            <button
              onClick={() => setNetworkStatus('3G')}
              className={`btn-net-toggle ${deviceState.networkStatus === '3G' ? 'active-3g' : ''}`}
            >
              <SignalLow size={15} />
              <span>3G Slow Signal</span>
            </button>
            <button
              onClick={() => setNetworkStatus('offline')}
              className={`btn-net-toggle ${deviceState.networkStatus === 'offline' ? 'active-offline' : ''}`}
            >
              <WifiOff size={15} />
              <span>Offline (No Signal)</span>
            </button>
          </div>

          {/* Pending Alerts Queue Callout */}
          <div className="pending-queue-box">
            <div className="queue-status-line">
              <Clock size={15} className="text-amber-400" />
              <span>
                Pending Alerts in Hardware Flash: <strong>{pendingQueue.length}</strong>
              </span>
            </div>
            {pendingQueue.length > 0 && (
              <p className="queue-hint">
                Switch back to <strong>4G LTE</strong> to observe automated dispatch retry!
              </p>
            )}
          </div>
        </div>

        {/* GPS Satellite Simulator & Cached Coordinates */}
        <div className="sim-control-card">
          <div className="sim-card-top">
            <div className="sim-title-row">
              <Navigation
                className={
                  deviceState.gpsStatus === 'locked'
                    ? 'text-cyan-400'
                    : deviceState.gpsStatus === 'searching'
                    ? 'text-amber-400 animate-spin'
                    : 'text-rose-400'
                }
                size={22}
              />
              <div>
                <h4>GPS Satellite Fix Simulator</h4>
                <span className="sim-state-text">Status: {deviceState.gpsStatus.toUpperCase()}</span>
              </div>
            </div>
            <span
              className={`badge-state ${
                deviceState.gpsStatus === 'locked'
                  ? 'normal'
                  : deviceState.gpsStatus === 'searching'
                  ? 'warning'
                  : 'danger'
              }`}
            >
              {deviceState.gpsStatus.toUpperCase()}
            </span>
          </div>

          <div className="sim-toggle-row">
            <button
              onClick={() => setGpsStatus('locked')}
              className={`btn-net-toggle ${deviceState.gpsStatus === 'locked' ? 'active-4g' : ''}`}
            >
              GPS Locked
            </button>
            <button
              onClick={() => setGpsStatus('searching')}
              className={`btn-net-toggle ${deviceState.gpsStatus === 'searching' ? 'active-3g' : ''}`}
            >
              Searching
            </button>
            <button
              onClick={() => setGpsStatus('offline')}
              className={`btn-net-toggle ${deviceState.gpsStatus === 'offline' ? 'active-offline' : ''}`}
            >
              GPS Unavailable
            </button>
          </div>

          {/* Last-known cached location display when GPS is unavailable */}
          {deviceState.gpsStatus === 'offline' ? (
            <div className="cached-location-card">
              <div className="cached-head">
                <AlertTriangle size={15} className="text-amber-400" />
                <span>Showing Last-Known Cached Location:</span>
              </div>
              <div className="cached-coords font-mono">
                Lat: {deviceState.lastKnownLocation?.lat.toFixed(4)}°, Lng: {deviceState.lastKnownLocation?.lng.toFixed(4)}°
              </div>
              <div className="cached-address">{deviceState.lastKnownLocation?.address}</div>
              <div className="cached-time">
                Timestamp: {new Date(deviceState.lastKnownLocation?.timestamp || Date.now()).toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <div className="cached-location-card normal-fix">
              <div className="cached-coords font-mono">
                Current Fix: {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E
              </div>
              <div className="cached-address">{location.address}</div>
            </div>
          )}
        </div>

        {/* Bluetooth 5.3 Wearable Link Simulator */}
        <div className="sim-control-card">
          <div className="sim-card-top">
            <div className="sim-title-row">
              <Bluetooth
                className={deviceState.bleConnected ? 'text-purple-400' : 'text-slate-500'}
                size={22}
              />
              <div>
                <h4>Bluetooth 5.3 Wearable Link</h4>
                <span className="sim-state-text">
                  {deviceState.bleConnected ? 'Paired & Synchronized' : 'Uncoupled / Out of Range'}
                </span>
              </div>
            </div>
            <button
              onClick={toggleBleConnected}
              className={`btn-ble-toggle ${deviceState.bleConnected ? 'active' : ''}`}
            >
              {deviceState.bleConnected ? 'Disconnect Band' : 'Pair Band'}
            </button>
          </div>

          <div className="ble-details-row">
            <div>
              <strong>Device Hardware ID:</strong> <span className="font-mono">{deviceState.deviceId}</span>
            </div>
            <div>
              <strong>Firmware Revision:</strong> <span className="font-mono">{deviceState.firmware}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
