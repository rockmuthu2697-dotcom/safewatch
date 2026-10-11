import React, { useState } from 'react';
import { useSafeWatch } from '../../context/SafeWatchContext';
import {
  Clock,
  ShieldAlert,
  MapPin,
  Camera,
  CheckCircle2,
  Trash2,
  Filter,
  Eye,
  X,
  ExternalLink,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function AlertHistoryTab() {
  const { alerts, clearAlertHistory, showToast } = useSafeWatch();

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const filteredAlerts = alerts.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'sos') return item.type.includes('SOS');
    if (filterType === 'health') return item.type.includes('Heartbeat');
    return true;
  });

  const handleConfirmClear = () => {
    clearAlertHistory();
    setConfirmClearOpen(false);
  };

  return (
    <div className="tab-pane history-tab">
      <div className="tab-header-banner">
        <div>
          <h2 className="tab-title">Emergency & Telemetry Audit Log</h2>
          <p className="tab-description">
            Complete cryptographic audit trail of triggered SOS alerts, GNSS coordinate fixes, and camera captures.
          </p>
        </div>
        <div className="tab-header-actions">
          {alerts.length > 0 && (
            <button
              onClick={() => setConfirmClearOpen(true)}
              className="btn-danger-outline"
            >
              <Trash2 size={15} />
              <span>Clear Demo History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="history-filters-bar">
        <div className="filter-buttons-row">
          <button
            onClick={() => setFilterType('all')}
            className={`filter-tab-btn ${filterType === 'all' ? 'active' : ''}`}
          >
            All Events ({alerts.length})
          </button>
          <button
            onClick={() => setFilterType('sos')}
            className={`filter-tab-btn ${filterType === 'sos' ? 'active' : ''}`}
          >
            Critical SOS ({alerts.filter((a) => a.type.includes('SOS')).length})
          </button>
          <button
            onClick={() => setFilterType('health')}
            className={`filter-tab-btn ${filterType === 'health' ? 'active' : ''}`}
          >
            System Diagnostics ({alerts.filter((a) => a.type.includes('Heartbeat')).length})
          </button>
        </div>

        <div className="filter-stats-text">
          Showing {filteredAlerts.length} recorded incident log(s)
        </div>
      </div>

      {/* Alerts List */}
      <div className="alerts-history-list">
        {filteredAlerts.length === 0 ? (
          <div className="empty-state-box">
            <Clock size={44} className="text-slate-500 mb-2" />
            <h3>No incidents match this filter</h3>
            <p>Trigger an SOS from the dashboard or hardware simulator to generate an incident log.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isSos = alert.type.includes('SOS');
            return (
              <div
                key={alert.id}
                className={`history-card ${isSos ? 'is-sos-card' : 'is-system-card'}`}
              >
                <div className="history-card-left">
                  <div className={`history-type-icon ${isSos ? 'sos-icon' : 'system-icon'}`}>
                    {isSos ? <ShieldAlert size={20} /> : <Clock size={20} />}
                  </div>

                  <div className="history-primary-info">
                    <div className="history-title-row">
                      <span className="history-item-type">{alert.type}</span>
                      <span className="history-badge-status">{alert.status}</span>
                    </div>

                    <div className="history-meta-row">
                      <span className="meta-time">
                        <Clock size={12} />
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </span>
                      <span className="meta-sep">•</span>
                      <span className="meta-trigger">Trigger: {alert.trigger}</span>
                    </div>

                    <p className="history-notes-text">{alert.notes}</p>
                  </div>
                </div>

                <div className="history-card-right">
                  <div className="history-location-tag">
                    <MapPin size={13} className="text-cyan-400" />
                    <span>
                      {alert.location?.lat.toFixed(4)}°N, {alert.location?.lng.toFixed(4)}°E (
                      {alert.location?.isReal ? 'Real GPS' : 'Demo Lab'})
                    </span>
                  </div>

                  <div className="history-actions-row">
                    {alert.snapshotData && (
                      <span className="badge-has-snapshot" title="Visual snapshot captured">
                        <Camera size={12} />
                        <span>Snapshot</span>
                      </span>
                    )}

                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="btn-view-details"
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="modal-backdrop" onClick={() => setSelectedAlert(null)}>
          <div className="modal-content alert-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <ShieldAlert className="text-rose-400" size={22} />
                <div>
                  <h3>Incident Record: {selectedAlert.id}</h3>
                  <p className="modal-subtitle">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedAlert(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="detail-modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Incident Type</span>
                  <span className="detail-value font-semibold text-rose-400">{selectedAlert.type}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Hardware Trigger Mechanism</span>
                  <span className="detail-value">{selectedAlert.trigger}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Delivery Status</span>
                  <span className="detail-value text-emerald-400 font-semibold">{selectedAlert.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Trusted Contacts Targeted</span>
                  <span className="detail-value">{selectedAlert.contactsNotified} contact(s)</span>
                </div>
              </div>

              {/* Coordinates Section */}
              <div className="detail-section">
                <div className="section-head-sm">
                  <MapPin size={16} className="text-cyan-400" />
                  <span>GNSS Location Telemetry</span>
                </div>
                <div className="detail-location-box">
                  <div className="coords-val font-mono">
                    Lat: {selectedAlert.location?.lat.toFixed(5)}, Lng: {selectedAlert.location?.lng.toFixed(5)}
                  </div>
                  <div className="address-val">{selectedAlert.location?.address}</div>
                  <div className="source-val text-xs text-slate-400 mt-1">
                    Origin: {selectedAlert.location?.isReal ? 'Real Browser Geolocation Fix' : 'Simulated Benchmark Coordinates'}
                  </div>

                  <a
                    href={`https://www.google.com/maps?q=${selectedAlert.location?.lat},${selectedAlert.location?.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-mini-link mt-2 inline-flex"
                  >
                    <ExternalLink size={12} />
                    <span>View Exact Pin on Google Maps</span>
                  </a>
                </div>
              </div>

              {/* Snapshot Frame if present */}
              {selectedAlert.snapshotData && (
                <div className="detail-section">
                  <div className="section-head-sm">
                    <Camera size={16} className="text-purple-400" />
                    <span>Incident Visual Snapshot</span>
                  </div>
                  <div className="detail-snapshot-img-wrap">
                    <img
                      src={selectedAlert.snapshotData}
                      alt="Incident Snapshot"
                      className="detail-snapshot-img"
                    />
                  </div>
                </div>
              )}

              <div className="detail-notes-card">
                <strong>Incident Dispatch Notes:</strong>
                <p>{selectedAlert.notes}</p>
              </div>
            </div>

            <div className="modal-actions-footer">
              <button
                type="button"
                className="btn-primary-purple"
                onClick={() => setSelectedAlert(null)}
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Clear Demo History */}
      {confirmClearOpen && (
        <div className="modal-backdrop" onClick={() => setConfirmClearOpen(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon-wrap">
              <AlertTriangle size={36} className="text-rose-400" />
            </div>
            <h3>Clear All Demo Alert History?</h3>
            <p>
              This will permanently delete all logged demo incident reports from browser localStorage. This action cannot be undone.
            </p>
            <div className="confirm-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmClearOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmClear}
              >
                Yes, Clear All History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
