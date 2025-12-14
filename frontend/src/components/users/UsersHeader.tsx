import React from 'react';
import { Users as UsersIcon } from 'lucide-react';

interface UsersHeaderProps {
    totalUsers: number;
    loading: boolean;
}

const UsersHeader: React.FC<UsersHeaderProps> = ({ totalUsers, loading }) => {
    return (
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-2xl p-6 text-white shadow-lg mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <UsersIcon size={28} className="text-white/90" />
                    <h1 className="text-2xl font-bold tracking-tight">Directorio de Usuarios</h1>
                </div>
                <p className="text-blue-100 text-sm font-medium sm:pl-10">Gestión centralizada de comunidad educativa</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20 shadow-inner flex flex-col items-end">
                <p className="text-xs text-blue-100 uppercase font-bold tracking-wider mb-0.5">Total Usuarios</p>
                <p className="text-3xl font-bold leading-none">{loading ? '...' : totalUsers}</p>
            </div>
        </div>
    );
};

export default UsersHeader;