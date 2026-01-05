'use client';
import { Search, Plus, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserSearchBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onAddClick: () => void;
    onCarnetClick?: () => void;
    entityType?: 'student' | 'teacher' | 'parent' | 'user';
}

export function UserSearchBar({
    searchQuery,
    onSearchChange,
    onAddClick,
    onCarnetClick,
    entityType = 'student'
}: UserSearchBarProps) {
    const getPlaceholder = () => {
        switch (entityType) {
            case 'student':
                return 'Buscar por nombre, código, nivel, 3C, 3°C...';
            case 'teacher':
                return 'Buscar por nombre, DNI, nivel, 3C, 3°C...';
            case 'parent':
                return 'Buscar por nombre o documento...';
            case 'user':
                return 'Buscar por nombre o DNI...';
            default:
                return 'Buscar...';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
        >
            {/* Search Input */}
            <div className="relative flex-1">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                    type="text"
                    placeholder={getPlaceholder()}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm"
                    style={{
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-primary)',
                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    }}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                {onCarnetClick && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onCarnetClick}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium shadow-sm transition-all border text-sm whitespace-nowrap"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-primary)'
                        }}
                    >
                        <CreditCard size={18} />
                        <span className="hidden sm:inline">Generar carnets</span>
                        <span className="sm:hidden">Carnets</span>
                    </motion.button>
                )}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onAddClick}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-white font-medium shadow-sm transition-all text-sm whitespace-nowrap"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
                    }}
                >
                    <Plus size={18} />
                    <span>Agregar</span>
                </motion.button>
            </div>
        </motion.div>
    );
}
