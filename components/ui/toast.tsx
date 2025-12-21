import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';
import { NotificationType } from '@/types';

interface NotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  showIcon?: boolean;
  duration?: number;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  showIcon = true,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    if (duration && type !== 'loading') {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, type]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    loading: <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    loading: 'bg-gray-50 border-gray-200',
  };

  const textColors = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-yellow-900',
    info: 'text-blue-900',
    loading: 'text-gray-900',
  };

  const progressColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    loading: 'bg-gray-500',
  };

  return (
    <div
      className={`${bgColors[type]} ${textColors[type]} border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md animate-in slide-in-from-right duration-300 relative overflow-hidden`}
    >
      <div className="flex items-start gap-3">
        {showIcon && icons[type]}
        <div className="flex-1">
          <p className="font-semibold text-sm">{title}</p>
          {message && <p className="text-xs mt-1 opacity-80">{message}</p>}
        </div>
        {type !== 'loading' && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Progress bar */}
      {duration && type !== 'loading' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div 
            className={`h-full ${progressColors[type]}`}
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default Notification;
export type { NotificationType };

