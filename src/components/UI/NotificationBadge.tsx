import React from 'react';
import { useNotificationContext } from '../../contexts/NotificationContext';

interface NotificationBadgeProps {
  module: 'clients' | 'properties' | 'inquiries' | 'appointments';
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ module, className = '' }) => {
  const { getModuleCounts } = useNotificationContext();
  const counts = getModuleCounts();
  const count = counts[module] || 0;

  if (count === 0) return null;

  return (
    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
};