import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

const Toast: React.FC<{
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onDismiss: () => void;
}> = ({ id, type, title, message, onDismiss }) => {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const iconMap = {
    success: <CheckCircle className="h-6 w-6 text-green-500" />,
    error: <AlertCircle className="h-6 w-6 text-red-500" />,
    warning: <AlertCircle className="h-6 w-6 text-yellow-500" />,
    info: <Info className="h-6 w-6 text-blue-500" />
  };

  const bgColorMap = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div
      className={`max-w-sm w-full rounded-lg shadow-lg border ${bgColorMap[type]} p-4 mb-3 pointer-events-auto animate-slide-in`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{iconMap[type]}</div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="mt-1 text-sm text-gray-500">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onDismiss}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const Toaster: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed inset-0 flex flex-col items-end justify-start px-4 py-6 pointer-events-none sm:p-6 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onDismiss={() => dismissToast(toast.id)}
        />
      ))}
    </div>
  );
};