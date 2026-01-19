'use client';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtext: string;
  mainIcon: LucideIcon;
  gradient: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export function KPICard({
  title,
  value,
  subtext,
  mainIcon: MainIcon,
  gradient,
  trend,
  trendValue,
}: KPICardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <div
      className={`relative rounded-2xl p-7 overflow-hidden shadow-md hover:shadow-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${gradient}`}
    >
      <div className="absolute -right-3 -bottom-3 opacity-15 pointer-events-none">
        <MainIcon size={100} className="text-white" />
      </div>

      <div className="relative z-10 flex items-start gap-4">
        <div className="flex items-center justify-center p-3 rounded-xl backdrop-blur-sm bg-white/20">
          <MainIcon size={32} className="text-white opacity-90" />
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <h3 className="text-4xl font-bold text-white leading-none tracking-tight">
            {value}
          </h3>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-white opacity-95 leading-tight">
              {title}
            </span>
            {(trend || trendValue) && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white opacity-85">
                {trend && <TrendIcon size={16} />}
                <span>{subtext}</span>
              </div>
            )}
            {!trend && !trendValue && (
              <span className="text-xs font-medium text-white opacity-75">
                {subtext}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
