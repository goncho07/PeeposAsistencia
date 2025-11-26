import React from 'react';

const StatBox = ({ title, value, sublabel, icon: Icon, color }: any) => (
    <div className={`p-5 rounded-xl text-white ${color} relative overflow-hidden shadow-md`}>
      <div className="relative z-10"><div className="flex items-center gap-2 mb-2"><Icon size={18} className="opacity-90" /><span className="text-xs font-semibold opacity-90">{title}</span></div><div className="text-3xl font-bold mb-1">{value}</div><div className="text-[11px] opacity-80">{sublabel}</div></div>
      <Icon size={64} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
    </div>
);

export default StatBox;