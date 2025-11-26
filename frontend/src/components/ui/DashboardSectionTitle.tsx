import React from 'react';

const DashboardSectionTitle: React.FC<{ title: string; icon?: any }> = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-700 pb-2">
    {Icon && <Icon size={18} className="text-gray-400 dark:text-gray-500" />}
    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{title}</h3>
  </div>
);

export default DashboardSectionTitle;