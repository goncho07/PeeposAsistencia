'use client';
import React from 'react';
import { motion } from 'framer-motion';
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

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

export function KPICard({
  title,
  value,
  subtext,
  mainIcon: MainIcon,
  gradient,
  trend,
  trendValue
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
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`kpi-card ${gradient}`}
    >
      <motion.div
        className="kpi-card-bg-icon"
        initial={{ rotate: 0 }}
        whileHover={{ rotate: 5, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <MainIcon size={100} className="text-white" />
      </motion.div>

      <div className="kpi-card-content">
        <motion.div
          className="kpi-card-icon-wrapper"
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <MainIcon size={32} className="text-white opacity-90" />
        </motion.div>

        <div className="kpi-card-stats">
          <motion.h3
            className="kpi-card-value"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            {value}
          </motion.h3>
          <div className="kpi-card-info">
            <span className="kpi-card-title">{title}</span>
            {(trend || trendValue) && (
              <div className="kpi-card-trend">
                {trend && <TrendIcon size={16} />}
                <span>{subtext}</span>
              </div>
            )}
            {!trend && !trendValue && (
              <span className="kpi-card-subtext">{subtext}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
