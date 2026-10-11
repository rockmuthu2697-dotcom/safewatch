import React, { useState } from 'react';
import { useSafeWatch } from '../../context/SafeWatchContext';
import {
  Users,
  UserPlus,
  Phone,
  MessageSquare,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Send,
  Shield,
  X,
  PhoneCall,
  Info
} from 'lucide-react';

export default function ContactsTab() {
  const {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    simulateSmsPing,
    showToast
  } = useSafeWatch();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relation: 'Guardian',
    priority: 1,
    receiveSms: true,
    receiveCall: true
  });
  const [errors, setErrors] = useState({});

  // Simulated ping feedback state per contact
  const [pingStatus, setPingStatus] = useState({});

  const openAddModal = () => {
    setEditingContact(null);
    setFormData({
      name: '',
      phone: '',
      relation: 'Guardian',
      priority: contacts.length + 1,
      receiveSms: true,
      receiveCall: true
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation || 'Guardian',
      priority: contact.priority || 1,
      receiveSms: contact.receiveSms !== false,
      receiveCall: contact.receiveCall !== false
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Contact name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[+0-9\s-]{4,18}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number format.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingContact) {
      updateContact({
        ...editingContact,
        ...formData,
        priority: Number(formData.priority)
      });
    } else {
      addContact({
        ...formData,
        priority: Number(formData.priority)
      });
    }
    setModalOpen(false);
  };

  const handleTestPing = (contactId) => {
    setPingStatus((prev) => ({ ...prev, [contactId]: 'sending' }));
    simulateSmsPing(contactId);

    setTimeout(() => {
      setPingStatus((prev) => ({ ...prev, [contactId]: 'delivered' }));
      setTimeout(() => {
        setPingStatus((prev) => {
          const next = { ...prev };
          delete next[contactId];
          return next;
        });
      }, 4000);
    }, 700);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from your trusted safety contacts?`)) {
      deleteContact(id);
    }
  };

  return (
    <div className="tab-pane contacts-tab">
      <div className="tab-header-banner">
        <div>
          <h2 className="tab-title">Trusted Emergency Circle</h2>
          <p className="tab-description">
            Registered contacts who immediately receive high-priority distress alerts, coordinates, and automated status calls.
          </p>
        </div>
        <div className="tab-header-actions">
          <button onClick={openAddModal} className="btn-primary-purple">
            <UserPlus size={16} />
            <span>Add Trusted Contact</span>
          </button>
        </div>
      </div>

      {/* Prototype Notice */}
      <div className="disclaimer-banner">
        <Info size={18} className="text-purple-400 shrink-0" />
        <div>
          <strong>PROTOTYPE DEMONSTRATION NOTICE:</strong> No actual cellular SMS or telephone calls are dispatched. All alert deliveries and delivery receipts are simulated inside this dashboard.
        </div>
      </div>

      {/* Contacts List Grid */}
      <div className="contacts-cards-grid">
        {contacts.length === 0 ? (
          <div className="empty-state-box">
            <Users size={48} className="text-slate-500 mb-2" />
            <h3>No trusted contacts registered</h3>
            <p>Add at least one trusted contact to enable emergency broadcasts.</p>
            <button onClick={openAddModal} className="btn-primary-purple mt-3">
              Add First Contact
            </button>
          </div>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="contact-card">
              <div className="contact-card-top">
                <div className="contact-avatar-lg">
                  {contact.name.charAt(0)}
                </div>
                <div className="contact-main-info">
                  <div className="contact-name-row">
                    <h3 className="contact-card-name">{contact.name}</h3>
                    {contact.isSample && (
                      <span className="sample-badge" title="Predefined sample data">
                        Demo Sample
                      </span>
                    )}
                  </div>
                  <div className="contact-relation-tag">
                    {contact.relation} • Priority {contact.priority}
                  </div>
                </div>

                <div className="contact-menu-actions">
                  <button
                    onClick={() => openEditModal(contact)}
                    className="icon-action-btn"
                    title="Edit Contact"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id, contact.name)}
                    className="icon-action-btn text-rose-400 hover:text-rose-300"
                    title="Delete Contact"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="contact-details-box">
                <div className="contact-phone-row">
                  <Phone size={14} className="text-purple-400" />
                  <span className="font-mono">{contact.phone}</span>
                </div>

                <div className="dispatch-channels-row">
                  <span
                    className={`channel-pill ${contact.receiveSms ? 'active' : 'inactive'}`}
                  >
                    <MessageSquare size={12} />
                    <span>SMS Alert</span>
                  </span>
                  <span
                    className={`channel-pill ${contact.receiveCall ? 'active' : 'inactive'}`}
                  >
                    <PhoneCall size={12} />
                    <span>Emergency Call</span>
                  </span>
                </div>
              </div>

              {/* Simulated Ping Action */}
              <div className="contact-card-bottom">
                <button
                  onClick={() => handleTestPing(contact.id)}
                  disabled={pingStatus[contact.id] === 'sending'}
                  className="btn-test-ping"
                >
                  <Send size={14} />
                  <span>
                    {pingStatus[contact.id] === 'sending'
                      ? 'Simulating Gateway Dispatch...'
                      : pingStatus[contact.id] === 'delivered'
                      ? '✓ Delivered (Demo Ack)'
                      : 'Simulate Emergency SMS Ping'}
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Users className="text-purple-400" size={20} />
                <h3>{editingContact ? 'Edit Trusted Contact' : 'Register New Trusted Contact'}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Priya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <span className="field-error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="text"
                  className={`form-input ${errors.phone ? 'input-error' : ''}`}
                  placeholder="e.g. +91 98765 43210 or 1091"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                {errors.phone && <span className="field-error-text">{errors.phone}</span>}
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Relationship</label>
                  <select
                    className="form-select"
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Friend">Friend</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Emergency Desk">Emergency Police Desk</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority Order (1 = First)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="form-input"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-checkboxes">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={formData.receiveSms}
                    onChange={(e) => setFormData({ ...formData, receiveSms: e.target.checked })}
                  />
                  <span>Dispatch SMS with Live GPS URL</span>
                </label>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={formData.receiveCall}
                    onChange={(e) => setFormData({ ...formData, receiveCall: e.target.checked })}
                  />
                  <span>Queue Auto-Dial Distress Voice Call</span>
                </label>
              </div>

              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-purple">
                  {editingContact ? 'Save Changes' : 'Register Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
