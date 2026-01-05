'use client';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserKPICardProps {
    title: string;
    count: number | string;
    icon: LucideIcon;
    gradient: string;
    active: boolean;
    onClick: () => void;
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

export function UserKPICard({
    title,
    count,
    icon: Icon,
    gradient,
    active,
    onClick
}: UserKPICardProps) {
    const [displayCount, setDisplayCount] = useState(0);
    const targetCount = typeof count === 'number' ? count : 0;

    useEffect(() => {
        if (typeof count !== 'number') {
            setDisplayCount(0);
            return;
        }

        let start = 0;
        const duration = 800;
        const increment = targetCount / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= targetCount) {
                setDisplayCount(targetCount);
                clearInterval(timer);
            } else {
                setDisplayCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [targetCount]);

    return (
        <motion.button
            variants={itemVariants}
            onClick={onClick}
            whileHover={{ scale: active ? 1 : 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`relative w-full text-left rounded-xl p-3 sm:p-4 overflow-hidden cursor-pointer ${
                active
                    ? `${gradient} shadow-lg`
                    : 'border'
            }`}
            style={{
                backgroundColor: active ? undefined : 'var(--color-surface)',
                borderColor: active ? undefined : 'var(--color-border)'
            }}
        >
            <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                <motion.div
                    className={`p-2 sm:p-3 rounded-lg ${
                        active
                            ? 'bg-white/20 backdrop-blur-sm'
                            : ''
                    }`}
                    style={{
                        backgroundColor: active ? undefined : 'var(--color-background)'
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                    <Icon
                        size={20}
                        className={`sm:w-6 sm:h-6 ${active ? 'text-white' : ''}`}
                        style={{ color: active ? 'white' : 'var(--color-text-secondary)' }}
                    />
                </motion.div>

                <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 truncate" style={{
                        color: active ? 'rgba(255, 255, 255, 0.9)' : 'var(--color-text-secondary)'
                    }}>
                        {title}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold" style={{
                        color: active ? 'white' : 'var(--color-text-primary)'
                    }}>
                        {typeof count === 'number' ? displayCount : count}
                    </p>
                </div>
            </div>

            {active && (
                <motion.div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    initial={{ scale: 0, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Icon size={120} className="text-white absolute -right-4 -bottom-4" />
                </motion.div>
            )}
        </motion.button>
    );
}
