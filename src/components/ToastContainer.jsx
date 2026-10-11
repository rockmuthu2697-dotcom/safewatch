import React from 'react';
import { useSafeWatch } from '../context/SafeWatchContext';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useSafeWatch();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let Icon = Info;
        let colorClass = 'toast-info';
        if (toast.type === 'success') {
          Icon = CheckCircle;
          colorClass = 'toast-success';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          colorClass = 'toast-warning';
        } else if (toast.type === 'error') {
          Icon = XCircle;
          colorClass = 'toast-error';
        }

        return (
          <div key={toast.id} className={`toast-card ${colorClass}`}>
            <div className="toast-icon-wrap">
              <Icon size={18} />
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="toast-close-btn"
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
