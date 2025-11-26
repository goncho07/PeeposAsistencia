'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, AlertCircle, Info, MoreHorizontal } from 'lucide-react';

export interface Notification {
  id: number;
  title: string;
  time: string;
  type: 'alert' | 'info' | 'success' | 'warning';
}

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification }) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
    <div className={`p-3 rounded-full shrink-0 ${
      notification.type === 'alert' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
      notification.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
      notification.type === 'warning' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' :
      'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
    }`}>
      {notification.type === 'alert' && <AlertTriangle size={20} />}
      {notification.type === 'success' && <CheckCircle2 size={20} />}
      {notification.type === 'warning' && <AlertCircle size={20} />}
      {notification.type === 'info' && <Info size={20} />}
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-bold text-gray-800 dark:text-white">{notification.title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
    </div>
    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
      <MoreHorizontal size={18} />
    </button>
  </div>
);

export default NotificationCard;
