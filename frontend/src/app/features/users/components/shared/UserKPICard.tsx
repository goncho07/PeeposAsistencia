'use client';
import { LucideIcon } from 'lucide-react';

interface UserKPICardProps {
  title: string;
  count: number | string;
  icon: LucideIcon;
  bgIcon: LucideIcon;
  colorClass: string;
  bgLight: string;
  borderColor: string;
  ringColor: string;
  active: boolean;
  loading?: boolean;
  onClick: () => void;
}

export function UserKPICard({
  title,
  count,
  icon: Icon,
  bgIcon: BgIcon,
  colorClass,
  bgLight,
  borderColor,
  ringColor,
  active,
  loading,
  onClick,
}: UserKPICardProps) {
  if (loading) {
    return <div className="h-40 bg-card animate-pulse rounded-2xl" />;
  }

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full text-left overflow-hidden p-4 rounded-2xl border-2 bg-surface shadow-sm
        transition-all duration-200 outline-none cursor-pointer
        focus-visible:ring-1  focus-visible:ring-primary
        ${active ? `${borderColor} ring-1 ring-offset-surface ${ringColor}` : 'border-border hover:border-border-dark'}
      `}
    >
      <div className={`absolute inset-0 opacity-10 bg-current ${colorClass}`} />

      <div className={`
        absolute -right-3 -bottom-3 transition-transform duration-500 ease-out
        ${colorClass} ${active ? 'opacity-20' : 'opacity-10'}
        group-hover:scale-110 group-hover:-rotate-6
      `}>
        <BgIcon size={140} strokeWidth={1.5} />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className={`
            inline-flex p-3 rounded-2xl shadow-sm mb-4 transition-all duration-200
            ${active ? `${bgLight} ${colorClass}` : 'bg-background text-text-secondary'}
          `}>
            <Icon size={32} strokeWidth={active ? 2.5 : 2} />
          </div>

          <h3 className={`
            text-base font-bold uppercase tracking-widest transition-colors
            ${active ? colorClass : 'text-text-primary'}
          `}>
            {title}
          </h3>
        </div>

        <div className="mt-2">
          <span className={`
            text-4xl font-extrabold tracking-tight transition-colors
            ${active ? 'text-text-primary' : 'text-text-secondary'}
          `}>
            {count}
          </span>
        </div>
      </div>
    </button>
  );
}
