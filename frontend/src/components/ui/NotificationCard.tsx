import React from 'react';

export interface Notification {
  id: number;
  title: string;
  time: string;
  type: 'alert' | 'info' | 'success' | 'warning';
}

const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => (
  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group">
    <div className="flex justify-between items-start mb-1">
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${notification.type === 'alert' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : notification.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : notification.type === 'warning' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
        {notification.type === 'alert' ? 'Alerta' : notification.type === 'success' ? 'Éxito' : notification.type === 'warning' ? 'Aviso' : 'Info'}
      </span>
      <span className="text-[10px] text-gray-400 dark:text-gray-500">{notification.time}</span>
    </div>
    <p className="text-xs font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{notification.title}</p>
  </div>
);

export default NotificationCard;