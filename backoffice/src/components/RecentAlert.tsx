import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';

interface RecentAlertProps {
  title: string;
  message: string;
  time: string;
  type?: 'warning' | 'error' | 'info';
}

const RecentAlert: React.FC<RecentAlertProps> = ({ title, message, time, type = 'warning' }) => {
  const getBorderColor = () => {
    switch(type) {
      case 'error':
        return 'border-red-500';
      case 'info':
        return 'border-blue-500';
      default:
        return 'border-red-500';
    }
  };

  const getIconColor = () => {
    switch(type) {
      case 'error':
        return 'text-red-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-red-500';
    }
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow mb-4 border-l-4 ${getBorderColor()}`}>
      <div className="flex items-start">
        <div className="mr-3">
          <AlertCircle className={`w-5 h-5 ${getIconColor()}`} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{message}</p>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentAlert;