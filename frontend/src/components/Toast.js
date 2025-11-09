import React, { useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Toast = ({ 
  type = 'success', 
  title, 
  message, 
  onClose, 
  duration = 5000,
  show = false 
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-400" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      case 'info':
      default:
        return 'text-blue-800';
    }
  };

  const getMessageColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'warning':
        return 'text-yellow-700';
      case 'error':
        return 'text-red-700';
      case 'info':
      default:
        return 'text-blue-700';
    }
  };

  return (
    <div className={`fixed top-4 right-4 max-w-md w-full ${getBackgroundColor()} border rounded-lg shadow-lg z-50 transition-all duration-300 transform`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className={`text-sm font-medium ${getTitleColor()}`}>
                {title}
              </p>
            )}
            {message && (
              <p className={`mt-1 text-sm ${getMessageColor()}`}>
                {message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                type === 'success' ? 'text-green-400 hover:text-green-500 focus:ring-green-500' :
                type === 'warning' ? 'text-yellow-400 hover:text-yellow-500 focus:ring-yellow-500' :
                type === 'error' ? 'text-red-400 hover:text-red-500 focus:ring-red-500' :
                'text-blue-400 hover:text-blue-500 focus:ring-blue-500'
              }`}
              onClick={onClose}
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;