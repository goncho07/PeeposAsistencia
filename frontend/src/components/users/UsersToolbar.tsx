import React from 'react';
import { Search, XCircle, Grid3x3, List, Plus, CreditCard } from 'lucide-react';

interface UsersToolbarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    onCreateUser: () => void;
    onGenerateCarnets: () => void;
}

const UsersToolbar: React.FC<UsersToolbarProps> = ({
    searchQuery,
    onSearchChange,
    viewMode,
    onViewModeChange,
    onCreateUser,
    onGenerateCarnets
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, DNI, código de estudiante..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Limpiar búsqueda"
                    >
                        <XCircle size={16} />
                    </button>
                )}
            </div>

            <div className="flex items-center gap-3">
                <div className="flex bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`p-2 rounded transition-colors ${viewMode === 'grid'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                            }`}
                        aria-label="Vista de cuadrícula"
                    >
                        <Grid3x3 size={20} />
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`p-2 rounded transition-colors ${viewMode === 'list'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                            }`}
                        aria-label="Vista de lista"
                    >
                        <List size={20} />
                    </button>
                </div>
                <button
                    onClick={onGenerateCarnets}
                    className="px-5 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md shadow-purple-200 dark:shadow-none"
                >
                    <CreditCard size={20} /> Generar Carnets
                </button>
                <button
                    onClick={onCreateUser}
                    className="px-5 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-200 dark:shadow-none"
                >
                    <Plus size={20} /> Nuevo Usuario
                </button>
            </div>
        </div>
    );
};

export default UsersToolbar;