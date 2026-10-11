// LocalStorage Helpers and Default Demo Data for SAFEWATCH

export const INITIAL_CONTACTS = [
  {
    id: 'c1',
    name: 'Ananya Sharma',
    phone: '+91 98765 43210',
    relation: 'Mother',
    priority: 1,
    isSample: true,
    receiveSms: true,
    receiveCall: true
  },
  {
    id: 'c2',
    name: 'Rahul Verma',
    phone: '+91 98123 45678',
    relation: 'Brother',
    priority: 2,
    isSample: true,
    receiveSms: true,
    receiveCall: false
  },
  {
    id: 'c3',
    name: 'Women Safety Helpline',
    phone: '1091',
    relation: 'Emergency Desk',
    priority: 3,
    isSample: true,
    receiveSms: true,
    receiveCall: true
  }
];

export const INITIAL_ALERTS = [
  {
    id: 'alt-102',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'SOS Emergency',
    trigger: 'Simulated 3s Hard Press',
    status: 'Delivered (Demo)',
    location: {
      lat: 12.9716,
      lng: 77.5946,
      address: 'Brigade Road Safety Corridor, Bangalore, KA',
      isReal: false
    },
    cameraCaptured: true,
    snapshotData: null,
    contactsNotified: 3,
    notes: 'Simulation initiated during system walkthrough.'
  },
  {
    id: 'alt-101',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    type: 'Routine Hardware Heartbeat',
    trigger: 'Scheduled Health Ping',
    status: 'Verified',
    location: {
      lat: 12.9716,
      lng: 77.5946,
      address: 'Brigade Road Safety Corridor, Bangalore, KA',
      isReal: false
    },
    cameraCaptured: false,
    snapshotData: null,
    contactsNotified: 0,
    notes: 'Battery 92%, Cellular RSSI -68dBm, GPS Lock acquired.'
  }
];

export const INITIAL_DEVICE_STATE = {
  battery: 84,
  isCharging: false,
  networkStatus: '4G', // '4G', '3G', 'offline'
  gpsStatus: 'locked',  // 'locked', 'searching', 'offline'
  bleConnected: true,
  deviceId: 'SW-NX942-PRO',
  firmware: 'v2.4.1-NEURONEX',
  soundEnabled: true,
  autoSnapshot: true,
  lastKnownLocation: {
    lat: 12.9716,
    lng: 77.5946,
    address: 'Brigade Road Safety Corridor, Bangalore, KA',
    timestamp: new Date(Date.now() - 900000).toISOString()
  }
};

const STORAGE_KEYS = {
  CONTACTS: 'safewatch_contacts_v1',
  ALERTS: 'safewatch_alerts_v1',
  DEVICE: 'safewatch_device_v1',
  PENDING_QUEUE: 'safewatch_pending_queue_v1'
};

export function loadSavedContacts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    if (!raw) return INITIAL_CONTACTS;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse contacts:', e);
    return INITIAL_CONTACTS;
  }
}

export function saveContacts(contacts) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  } catch (e) {
    console.error('Failed to save contacts:', e);
  }
}

export function loadSavedAlerts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (!raw) return INITIAL_ALERTS;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse alerts:', e);
    return INITIAL_ALERTS;
  }
}

export function saveAlerts(alerts) {
  try {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  } catch (e) {
    console.error('Failed to save alerts:', e);
  }
}

export function loadDeviceState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEVICE);
    if (!raw) return INITIAL_DEVICE_STATE;
    return { ...INITIAL_DEVICE_STATE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to parse device state:', e);
    return INITIAL_DEVICE_STATE;
  }
}

export function saveDeviceState(state) {
  try {
    localStorage.setItem(STORAGE_KEYS.DEVICE, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save device state:', e);
  }
}

export function resetAllDemoData() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONTACTS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.DEVICE);
    localStorage.removeItem(STORAGE_KEYS.PENDING_QUEUE);
    return true;
  } catch (e) {
    console.error('Failed to reset demo data:', e);
    return false;
  }
}
