import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="toast-container-custom">
        {toasts.map((toast) => {
          let bgClass = 'bg-white text-dark border-light';
          let IconComponent = CheckCircle2;
          let iconColor = 'text-success';

          if (toast.type === 'success') {
            bgClass = 'bg-white text-dark border-success-subtle';
            IconComponent = CheckCircle2;
            iconColor = 'text-success';
          } else if (toast.type === 'error') {
            bgClass = 'bg-white text-dark border-danger-subtle';
            IconComponent = AlertCircle;
            iconColor = 'text-danger';
          } else if (toast.type === 'warning') {
            bgClass = 'bg-white text-dark border-warning-subtle';
            IconComponent = AlertTriangle;
            iconColor = 'text-warning';
          } else if (toast.type === 'info') {
            bgClass = 'bg-white text-dark border-primary-subtle';
            IconComponent = Info;
            iconColor = 'text-primary';
          }

          return (
            <div
              key={toast.id}
              className={`toast-item border shadow-sm ${bgClass}`}
              role="alert"
            >
              <div className="d-flex align-items-center gap-2">
                <IconComponent size={18} className={iconColor} />
                <span className="fw-medium small">{toast.message}</span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-link text-muted p-0 ms-2"
                onClick={() => removeToast(toast.id)}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg) => console.log('Toast:', msg),
      removeToast: () => {},
    };
  }
  return context;
};

export default ToastProvider;
