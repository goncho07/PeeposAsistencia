'use client';
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface AttendanceData {
    students: {
        present: number;
        late: number;
        absent: number;
        justified: number;
    };
    teachers: {
        present: number;
        late: number;
        absent: number;
    };
}

interface AttendanceDonutChartProps {
    data: AttendanceData;
}

type FilterType = 'total' | 'estudiante' | 'docente';

const COLORS = {
    presente: '#10b981',
    tardanza: '#f59e0b',
    ausente: '#ef4444',
    falta: '#64748b'
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 30
        }
    }
};

export function AttendanceDonutChart({ data }: AttendanceDonutChartProps) {
    const [filter, setFilter] = useState<FilterType>('total');

    const getChartData = () => {
        switch (filter) {
            case 'estudiante':
                return [
                    { name: 'Presente', value: data.students.present, color: COLORS.presente },
                    { name: 'Tardanza', value: data.students.late, color: COLORS.tardanza },
                    { name: 'Ausente', value: data.students.absent, color: COLORS.ausente },
                    { name: 'Falta', value: data.students.justified, color: COLORS.falta }
                ];
            case 'docente':
                return [
                    { name: 'Presente', value: data.teachers.present, color: COLORS.presente },
                    { name: 'Tardanza', value: data.teachers.late, color: COLORS.tardanza },
                    { name: 'Ausente', value: data.teachers.absent, color: COLORS.ausente }
                ];
            case 'total':
            default:
                return [
                    {
                        name: 'Presente',
                        value: data.students.present + data.teachers.present,
                        color: COLORS.presente
                    },
                    {
                        name: 'Tardanza',
                        value: data.students.late + data.teachers.late,
                        color: COLORS.tardanza
                    },
                    {
                        name: 'Ausente',
                        value: data.students.absent + data.teachers.absent + data.students.justified,
                        color: COLORS.ausente
                    }
                ];
        }
    };

    const chartData = getChartData();
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <motion.div
            className="card h-full"
            variants={cardVariants}
            initial="hidden"
            animate="show"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Asistencia del Día
                </h3>
                <div className="flex gap-2">
                    {(['total', 'estudiante', 'docente'] as FilterType[]).map((type) => (
                        <motion.button
                            key={type}
                            onClick={() => setFilter(type)}
                            whileTap={{ scale: 0.95 }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                filter === type
                                    ? 'text-white'
                                    : 'hover:bg-opacity-10'
                            }`}
                            style={{
                                backgroundColor: filter === type
                                    ? 'var(--color-primary)'
                                    : 'transparent',
                                color: filter === type
                                    ? 'white'
                                    : 'var(--color-text-secondary)',
                                border: filter === type
                                    ? 'none'
                                    : '1px solid var(--color-border)'
                            }}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                <div className="relative w-full max-w-xs">
                    <ResponsiveContainer width="100%" height={210}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '0.5rem',
                                }}
                                itemStyle={{
                                    color: 'var(--color-text-primary)',
                                    fontWeight: 500
                                }}
                                labelStyle={{
                                    color: 'var(--color-text-secondary)'
                                }}
                                wrapperStyle={{
                                    zIndex: 9999,
                                    pointerEvents: 'none',
                                    position: 'absolute'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <div className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                {total}
                            </div>
                            <div className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                Total
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                    {chartData.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 p-3 rounded-lg"
                            style={{ backgroundColor: 'var(--color-surface)' }}
                        >
                            <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text-secondary)' }}>
                                    {item.name}
                                </div>
                                <div className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                                    {item.value}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                    {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
