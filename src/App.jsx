import React, { useState } from 'react';
import { SafeWatchProvider, useSafeWatch } from './context/SafeWatchContext';
import Header from './components/Header';
import ToastContainer from './components/ToastContainer';
import SosModal from './components/SosModal';
import FingerprintAuthModal from './components/FingerprintAuthModal';
import JudgesGuideModal from './components/JudgesGuideModal';

import DashboardTab from './components/tabs/DashboardTab';
import LocationTab from './components/tabs/LocationTab';
import CameraTab from './components/tabs/CameraTab';
import ContactsTab from './components/tabs/ContactsTab';
import AlertHistoryTab from './components/tabs/AlertHistoryTab';
import DeviceControlsTab from './components/tabs/DeviceControlsTab';
import SettingsTab from './components/tabs/SettingsTab';

import {
  LayoutDashboard,
  MapPin,
  Camera,
  Users,
  Clock,
  Sliders,
  Settings,
  ShieldAlert,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [judgesGuideOpen, setJudgesGuideOpen] = useState(false);

  const {
    emergencyActive,
    cancelEmergency,
    contacts,
    alerts,
    pendingQueue
  } = useSafeWatch();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'location', label: 'Live Location', icon: MapPin },
    { id: 'camera', label: 'Emergency Video', icon: Camera },
    { id: 'contacts', label: 'Trusted Contacts', icon: Users, badge: contacts.length },
    { id: 'history', label: 'Alert History', icon: Clock, badge: alerts.length },
    { id: 'device', label: 'Hardware Controls', icon: Sliders, badge: pendingQueue.length > 0 ? `${pendingQueue.length} Queue` : null, badgeColor: 'warning' },
    { id: 'settings', label: 'Settings & Privacy', icon: Settings }
  ];

  return (
    <div className="app-shell">
      {/* Emergency Active Warning Bar */}
      {emergencyActive && (
        <div className="emergency-banner-ticker">
          <div className="ticker-content">
            <span className="ticker-pulse"></span>
            <strong>CRITICAL DISTRESS ALERT ACTIVE:</strong> Emergency broadcast sent to {contacts.length} trusted contacts. GPS and visual buffer transmitting.
          </div>
          <div className="ticker-actions">
            <button
              onClick={() => setSosModalOpen(true)}
              className="btn-ticker-view"
            >
              View Dispatch
            </button>
            <button
              onClick={cancelEmergency}
              className="btn-ticker-standdown"
            >
              <RotateCcw size={13} />
              <span>Stand Down</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        onOpenJudgesGuide={() => setJudgesGuideOpen(true)}
        onOpenSosModal={() => setSosModalOpen(true)}
      />

      {/* Navigation Tab Bar */}
      <nav className="tab-navigation-bar" aria-label="Main Navigation">
        <div className="nav-container">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-tab-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`nav-badge ${item.badgeColor || 'primary'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="app-main-content">
        <div className="content-container">
          {activeTab === 'dashboard' && (
            <DashboardTab
              onNavigateTab={setActiveTab}
              onOpenSosModal={() => setSosModalOpen(true)}
            />
          )}

          {activeTab === 'location' && <LocationTab />}

          {activeTab === 'camera' && <CameraTab />}

          {activeTab === 'contacts' && <ContactsTab />}

          {activeTab === 'history' && <AlertHistoryTab />}

          {activeTab === 'device' && (
            <DeviceControlsTab onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab onNavigateTab={setActiveTab} />
          )}
        </div>
      </main>

      {/* Footer Branding & Disclaimer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span><strong>SAFEWATCH</strong> Smart Women Safety Device Prototype</span>
            <span className="footer-sep">•</span>
            <span>Developed by <strong>Team Neuronex</strong></span>
          </div>
          <div className="footer-right">
            <span>Hackathon Demo Edition • Client-side Simulation • Zero Cloud Storage</span>
          </div>
        </div>
      </footer>

      {/* Modals & Portals */}
      <SosModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        onRequireAuth={() => setAuthModalOpen(true)}
      />

      <FingerprintAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onVerified={() => {
          setAuthModalOpen(false);
          setSosModalOpen(true);
        }}
      />

      <JudgesGuideModal
        isOpen={judgesGuideOpen}
        onClose={() => setJudgesGuideOpen(false)}
        onNavigateTab={setActiveTab}
        onOpenSosModal={() => setSosModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* In-app Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <SafeWatchProvider>
      <MainApp />
    </SafeWatchProvider>
  );
}
