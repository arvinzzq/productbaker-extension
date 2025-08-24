import React from 'react';
import { Badge } from './badge';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'missing' | 'available';
  text?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, text, showIcon = true }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          className: 'bg-green-50 text-green-700 border-green-200',
          icon: '✓',
          defaultText: 'Good'
        };
      case 'warning':
        return {
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
          icon: '!',
          defaultText: 'Warning'
        };
      case 'error':
        return {
          className: 'bg-red-50 text-red-700 border-red-200',
          icon: '×',
          defaultText: 'Error'
        };
      case 'available':
        return {
          className: 'bg-green-50 text-green-700 border-green-200',
          icon: '✓',
          defaultText: 'Available'
        };
      case 'missing':
      default:
        return {
          className: 'bg-gray-50 text-gray-700 border-gray-200',
          icon: '○',
          defaultText: 'Missing'
        };
    }
  };

  const config = getStatusConfig();
  const displayText = text || config.defaultText;

  return (
    <Badge variant="outline" className={`text-xs ${config.className}`}>
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {displayText}
    </Badge>
  );
}