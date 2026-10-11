import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loadSavedContacts,
  saveContacts,
  loadSavedAlerts,
  saveAlerts,
  loadDeviceState,
  saveDeviceState,
  resetAllDemoData,
  INITIAL_CONTACTS,
  INITIAL_ALERTS,
  INITIAL_DEVICE_STATE
} from '../utils/storage';
import { playBeep, playSuccessChime, startEmergencySiren, stopEmergencySiren } from '../utils/sound';

const SafeWatchContext = createContext(null);

export function SafeWatchProvider({ children }) {
  // Device state
  const [deviceState, setDeviceState] = useState(() => loadDeviceState());
  const [contacts, setContacts] = useState(() => loadSavedContacts());
  const [alerts, setAlerts] = useState(() => loadSavedAlerts());
  const [pendingQueue, setPendingQueue] = useState([]);

  // Geolocation state
  const [location, setLocation] = useState({
    lat: 12.9716,
    lng: 77.5946,
    accuracy: 4.8,
    address: 'Demo Lab Pin: Brigade Rd Safety Corridor, Bangalore',
    isReal: false,
    timestamp: new Date().toISOString()
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Camera & Snapshot
  const [lastSnapshot, setLastSnapshot] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraIsReal, setCameraIsReal] = useState(false);

  // SOS & Emergency Workflow
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [currentEmergency, setCurrentEmergency] = useState(null);
  const [sirenPlaying, setSirenPlaying] = useState(false);

  // In-app Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    saveContacts(contacts);
  }, [contacts]);

  useEffect(() => {
    saveAlerts(alerts);
  }, [alerts]);

  useEffect(() => {
    saveDeviceState(deviceState);
  }, [deviceState]);

  // Telemetry updates
  const setBattery = useCallback((val) => {
    const num = Math.min(100, Math.max(0, Number(val)));
    setDeviceState((prev) => ({ ...prev, battery: num }));
    if (num <= 20) {
      showToast('Low Battery Warning', `Wearable battery at ${num}%. Power-saving mode advised.`, 'warning');
    }
  }, [showToast]);

  const setNetworkStatus = useCallback((status) => {
    setDeviceState((prev) => {
      const oldStatus = prev.networkStatus;
      const updated = { ...prev, networkStatus: status };

      if (status === 'offline') {
        showToast('Cellular Disconnected', 'Wearable has lost GSM/LTE signal. Alerts will queue.', 'warning');
      } else if (oldStatus === 'offline' && (status === '4G' || status === '3G')) {
        showToast('Network Restored', `Reconnected via ${status}. Checking pending dispatch queue...`, 'success');
      }
      return updated;
    });
  }, [showToast]);

  const setGpsStatus = useCallback((status) => {
    setDeviceState((prev) => {
      if (status === 'offline') {
        showToast('GPS Signal Lost', 'Showing last-known cached coordinates with timestamp.', 'warning');
      } else if (status === 'locked') {
        showToast('GPS Satellite Lock', 'High precision 3D lock acquired (accuracy < 5m).', 'success');
      }
      return { ...prev, gpsStatus: status };
    });
  }, [showToast]);

  const toggleBleConnected = useCallback(() => {
    setDeviceState((prev) => {
      const next = !prev.bleConnected;
      showToast(
        next ? 'BLE Wearable Paired' : 'BLE Disconnected',
        next ? 'SAFEWATCH Band connected via Bluetooth 5.3 Low Energy.' : 'Simulation: Wearable out of range or uncoupled.',
        next ? 'success' : 'error'
      );
      return { ...prev, bleConnected: next };
    });
  }, [showToast]);

  const toggleSound = useCallback(() => {
    setDeviceState((prev) => {
      const next = !prev.soundEnabled;
      if (!next && sirenPlaying) {
        stopEmergencySiren();
        setSirenPlaying(false);
      }
      showToast('Sound Preferences', next ? 'Emergency audible siren enabled.' : 'Siren muted.', 'info');
      return { ...prev, soundEnabled: next };
    });
  }, [sirenPlaying, showToast]);

  // Network queue retry: When network switches from offline to online, flush queued alerts
  useEffect(() => {
    if (deviceState.networkStatus !== 'offline' && pendingQueue.length > 0) {
      showToast('Dispatching Queued Alerts', `Sending ${pendingQueue.length} pending alert(s) now that network is back!`, 'success');
      playSuccessChime();

      setAlerts((prevAlerts) =>
        prevAlerts.map((a) => {
          const match = pendingQueue.find((q) => q.id === a.id);
          if (match) {
            return {
              ...a,
              status: `Delivered via ${deviceState.networkStatus} (Retried)`,
              notes: `${a.notes} [Auto-dispatched upon network reconnection]`
            };
          }
          return a;
        })
      );
      setPendingQueue([]);
    }
  }, [deviceState.networkStatus, pendingQueue, showToast]);

  // Real Geolocation querying
  const requestRealLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      showToast('Location Error', 'Geolocation is not supported by your browser. Using sample coordinates.', 'error');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const newLoc = {
          lat: parseFloat(latitude.toFixed(5)),
          lng: parseFloat(longitude.toFixed(5)),
          accuracy: Math.round(accuracy),
          address: `Live GPS Fix: Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`,
          isReal: true,
          timestamp: new Date().toISOString()
        };
        setLocation(newLoc);
        setLocationLoading(false);
        // Also update last known in device state
        setDeviceState((prev) => ({
          ...prev,
          lastKnownLocation: newLoc,
          gpsStatus: 'locked'
        }));
        showToast('Real Geolocation Acquired', `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (±${Math.round(accuracy)}m)`, 'success');
        playBeep(880, 0.1);
      },
      (err) => {
        setLocationLoading(false);
        let msg = 'Could not acquire real location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied by user. Falling back to clearly marked demo coordinates.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location signal unavailable. Using sample coordinates.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Using sample coordinates.';
        }
        setLocationError(msg);
        showToast('Permission / Location Info', msg, 'info');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [showToast]);

  const useSampleLocation = useCallback(() => {
    const sample = {
      lat: 12.9716,
      lng: 77.5946,
      accuracy: 4.8,
      address: 'Demo Lab Pin: Brigade Rd Safety Corridor, Bangalore',
      isReal: false,
      timestamp: new Date().toISOString()
    };
    setLocation(sample);
    setLocationError(null);
    showToast('Sample Location Loaded', 'Using benchmark hackathon demo coordinates.', 'info');
  }, [showToast]);

  // Trigger SOS Emergency Workflow
  const triggerEmergency = useCallback((triggerType = 'Wearable SOS Button') => {
    const isOffline = deviceState.networkStatus === 'offline';
    const alertId = `alt-${Date.now().toString().slice(-4)}`;

    const newAlert = {
      id: alertId,
      timestamp: new Date().toISOString(),
      type: '🚨 CRITICAL SOS EMERGENCY',
      trigger: triggerType,
      status: isOffline ? 'Queued (Offline) - Auto-retry pending' : 'Dispatched (Demo Simulation)',
      location: { ...location },
      cameraCaptured: Boolean(lastSnapshot),
      snapshotData: lastSnapshot,
      contactsNotified: isOffline ? 0 : contacts.length,
      notes: isOffline
        ? 'Alert held in device flash memory until cellular handshake returns.'
        : `Sent emergency SMS and coordinates link to ${contacts.length} trusted contacts.`
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setCurrentEmergency(newAlert);
    setEmergencyActive(true);

    if (isOffline) {
      setPendingQueue((prev) => [...prev, newAlert]);
      showToast('Alert Queued Offline', 'No cellular connection. Alert will automatically transmit when network returns.', 'warning');
    } else {
      showToast('Emergency SOS Broadcasted', `Dispatched coordinates to ${contacts.length} trusted contacts.`, 'error');
    }

    if (deviceState.soundEnabled) {
      startEmergencySiren();
      setSirenPlaying(true);
    }
  }, [deviceState.networkStatus, deviceState.soundEnabled, location, lastSnapshot, contacts, showToast]);

  const cancelEmergency = useCallback(() => {
    stopEmergencySiren();
    setSirenPlaying(false);
    setEmergencyActive(false);
    setCurrentEmergency(null);
    showToast('Emergency Stand Down', 'Active SOS alert has been cancelled by user.', 'info');
    playSuccessChime();
  }, [showToast]);

  // Contacts CRUD
  const addContact = useCallback((contactData) => {
    const newContact = {
      ...contactData,
      id: `c-${Date.now().toString().slice(-4)}`,
      isSample: false
    };
    setContacts((prev) => [...prev, newContact]);
    showToast('Contact Added', `${newContact.name} registered as Trusted Contact.`, 'success');
    playSuccessChime();
  }, [showToast]);

  const updateContact = useCallback((updated) => {
    setContacts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showToast('Contact Updated', `Details for ${updated.name} updated.`, 'success');
  }, [showToast]);

  const deleteContact = useCallback((id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    showToast('Contact Removed', 'Trusted contact deleted from device registry.', 'info');
  }, [showToast]);

  const simulateSmsPing = useCallback((contactId) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;
    playBeep(900, 0.12);
    showToast('Simulated SMS Ping', `[DEMO SIMULATION] SMS packet sent to ${contact.name} (${contact.phone}) with live location link.`, 'info');
  }, [contacts, showToast]);

  // Alerts Management
  const clearAlertHistory = useCallback(() => {
    setAlerts([]);
    saveAlerts([]);
    showToast('Alert History Cleared', 'All stored emergency records have been cleared.', 'info');
  }, [showToast]);

  // Factory Reset
  const handleResetDemoData = useCallback(() => {
    resetAllDemoData();
    setDeviceState(INITIAL_DEVICE_STATE);
    setContacts(INITIAL_CONTACTS);
    setAlerts(INITIAL_ALERTS);
    setPendingQueue([]);
    setLastSnapshot(null);
    setLocation({
      lat: 12.9716,
      lng: 77.5946,
      accuracy: 4.8,
      address: 'Demo Lab Pin: Brigade Rd Safety Corridor, Bangalore',
      isReal: false,
      timestamp: new Date().toISOString()
    });
    stopEmergencySiren();
    setSirenPlaying(false);
    setEmergencyActive(false);
    showToast('Demo Data Reset', 'Device settings, sample contacts, and alerts restored to defaults.', 'success');
    playSuccessChime();
  }, [showToast]);

  return (
    <SafeWatchContext.Provider
      value={{
        deviceState,
        setBattery,
        setNetworkStatus,
        setGpsStatus,
        toggleBleConnected,
        toggleSound,
        location,
        locationLoading,
        locationError,
        requestRealLocation,
        useSampleLocation,
        lastSnapshot,
        setLastSnapshot,
        cameraActive,
        setCameraActive,
        cameraIsReal,
        setCameraIsReal,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        simulateSmsPing,
        alerts,
        clearAlertHistory,
        pendingQueue,
        sosModalOpen,
        setSosModalOpen,
        authModalOpen,
        setAuthModalOpen,
        emergencyActive,
        currentEmergency,
        triggerEmergency,
        cancelEmergency,
        sirenPlaying,
        handleResetDemoData,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </SafeWatchContext.Provider>
  );
}

export function useSafeWatch() {
  const context = useContext(SafeWatchContext);
  if (!context) {
    throw new Error('useSafeWatch must be used within a SafeWatchProvider');
  }
  return context;
}
