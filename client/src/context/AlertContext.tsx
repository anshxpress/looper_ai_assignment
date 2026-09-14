import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import styles from '../components/common/AlertChip.module.css';

export type AlertType = 'success' | 'error' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
}

interface AlertContextValue {
  showAlert: (type: AlertType, title: string, message?: string) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = useCallback((type: AlertType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setAlerts((prev) => [...prev, { id, type, title, message }]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
  }, []);

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className={styles.alertContainer}>
        {alerts.map((alert) => (
          <div key={alert.id} className={`${styles.alertChip} ${styles[alert.type]}`}>
            <div className={styles.icon}>
              {alert.type === 'success' && <CheckCircle2 size={18} />}
              {alert.type === 'error' && <AlertCircle size={18} />}
              {alert.type === 'info' && <Info size={18} />}
            </div>
            <div className={styles.content}>
              <div className={styles.title}>{alert.title}</div>
              {alert.message && <div className={styles.message}>{alert.message}</div>}
            </div>
            <button className={styles.closeBtn} onClick={() => removeAlert(alert.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within an AlertProvider');
  return ctx;
};
