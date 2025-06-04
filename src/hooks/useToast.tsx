import React, { createContext, useState, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = uuidv4();
    setToasts(prevToasts => [...prevToasts, { ...toast, id }]);
  };
  
  const dismissToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    // If we're not in a provider, create a mock implementation
    // This is just for convenience during development
    return {
      toasts: [],
      showToast: (toast: Omit<Toast, 'id'>) => {
        console.log('Toast (mock):', toast);
      },
      dismissToast: (id: string) => {
        console.log('Dismiss toast (mock):', id);
      }
    };
  }
  
  return context;
};