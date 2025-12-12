import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserProfile } from '@/types/userTypes';
import UserCard from '@/components/ui/UserCard';
import UserTable from '@/components/ui/UserTable';

interface UsersContentProps {
    users: UserProfile[];
    loading: boolean;
    viewMode: 'grid' | 'list';
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onViewUser: (user: UserProfile) => void;
    onEditUser: (user: UserProfile) => void;
    onDeleteUser: (userId: number, userType: string) => void;
}

const UsersContent: React.FC<UsersContentProps> = ({
    users,
    loading,
    viewMode,
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    onViewUser,
    onEditUser,
    onDeleteUser
}) => {
    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex-1 flex flex-col min-h-[400px]">
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
                    <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
                    <p className="text-sm font-medium">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex-1 flex flex-col min-h-[400px]">
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-full mb-4">
                        <Search size={32} className="opacity-30" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">No se encontraron usuarios</h3>
                    <p className="text-sm">Intenta con otros términos de búsqueda o filtros.</p>
                </div>
            </div>
        );
    }

    const totalUsers = users.length;
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalUsers);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden flex-1 flex flex-col min-h-[400px]">
            {viewMode === 'grid' ? (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {users.map(user => (
                            <UserCard
                                key={`${user.type}-${user.id}`}
                                user={user}
                                onClick={() => onViewUser(user)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <UserTable
                    users={users}
                    onViewUser={onViewUser}
                    onEditUser={onEditUser}
                    onDeleteUser={onDeleteUser}
                />
            )}

            {totalPages > 1 && (
                <div className="border-t border-gray-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-slate-800/50 mt-auto">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Mostrando {startIndex} - {endIndex} de {totalUsers} usuarios
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Página anterior"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            return pageNum;
                        }).map(p => (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${currentPage === p
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    }`}
                                aria-label={`Página ${p}`}
                                aria-current={currentPage === p ? 'page' : undefined}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Página siguiente"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersContent;