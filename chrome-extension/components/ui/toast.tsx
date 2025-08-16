import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div 
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 max-w-sm',
        getBackgroundColor(),
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      {getIcon()}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button 
        onClick={handleClose}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface UseToastReturn {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toastElement: React.ReactNode;
}

export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    id: number;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  const hideToast = () => {
    setToast(null);
  };

  const toastElement = toast ? (
    <Toast
      key={toast.id}
      message={toast.message}
      type={toast.type}
      onClose={hideToast}
    />
  ) : null;

  return { showToast, toastElement };
}