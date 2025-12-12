'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GraduationCap, Briefcase, Shield, User as UserIcon, BookOpen, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { UserProfile, isStudent, isTeacher, isParent, isAdmin } from '@/types/userTypes';

interface UserTableProps {
    users: UserProfile[];
    onViewUser: (user: UserProfile) => void;
    onEditUser: (user: UserProfile) => void;
    onDeleteUser: (userId: number, userType: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onViewUser, onEditUser, onDeleteUser }) => {
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleMenuToggle = (e: React.MouseEvent, userId: number, userType: string) => {
        e.stopPropagation();
        const menuId = `${userType}-${userId}`;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

        setMenuPosition({
            x: rect.right - 160,
            y: rect.bottom + 4,
        });

        setActiveMenuId(activeMenuId === menuId ? null : menuId);
    };

    const closeMenu = () => setActiveMenuId(null);

    useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4">Usuario</th>
                        <th className="px-6 py-4">Tipo</th>
                        <th className="px-6 py-4">Nivel/Área</th>
                        <th className="px-6 py-4">Aula/Información</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {users.map((user) => {
                        const menuId = `${user.type}-${user.id}`;
                        const isMenuActive = activeMenuId === menuId;
                        
                        return (
                            <tr
                                key={menuId}
                                className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewUser(user)}>
                                        <div
                                            className={`w-9 h-9 rounded-full ${user.avatarGradient} flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0`}
                                        >
                                            {user.avatarUrl ? (
                                                <img
                                                    src={user.avatarUrl}
                                                    alt={user.fullName}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                user.fullName.charAt(0)
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base truncate">
                                                {user.fullName}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium truncate">
                                                {isStudent(user) ? `Código: ${user.studentCode}` : `DNI: ${user.dni}`}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {isStudent(user) && <GraduationCap size={16} className="text-blue-500" />}
                                        {isTeacher(user) && <Briefcase size={16} className="text-purple-500" />}
                                        {isAdmin(user) && <Shield size={16} className="text-slate-500" />}
                                        {isParent(user) && <UserIcon size={16} className="text-orange-500" />}
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{user.type}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 dark:bg-slate-700 rounded-md text-xs text-gray-600 dark:text-gray-300 font-medium">
                                        {isStudent(user) ? user.level : isTeacher(user) ? user.level : user.headerLabel}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {isStudent(user) && user.aulaInfo ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md text-xs text-blue-600 dark:text-blue-400 font-medium">
                                            <BookOpen size={12} />
                                            {user.aulaInfo.code}
                                        </span>
                                    ) : isParent(user) ? (
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {user.children.length} hijo(s)
                                        </span>
                                    ) : isTeacher(user) ? (
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {user.area}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${user.status === 'ACTIVO'
                                            ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                            }`}
                                    >
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={(e) => handleMenuToggle(e, user.id, user.type)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                            aria-label="Menú de acciones"
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>

                                        {isMenuActive && createPortal(
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                className="fixed z-9999 w-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl p-1 animate-in fade-in-0 zoom-in-95"
                                                style={{
                                                    left: `${menuPosition.x}px`,
                                                    top: `${menuPosition.y}px`,
                                                }}
                                            >
                                                <button
                                                    onClick={() => {
                                                        closeMenu();
                                                        onViewUser(user);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                                                >
                                                    <Eye size={14} /> Ver Detalle
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        closeMenu();
                                                        onEditUser(user);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center gap-2"
                                                >
                                                    <Edit size={14} /> Editar
                                                </button>
                                                <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                                                <button
                                                    onClick={() => {
                                                        closeMenu();
                                                        onDeleteUser(user.id, user.type);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"
                                                >
                                                    <Trash2 size={14} /> Eliminar
                                                </button>
                                            </div>,
                                            document.body
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;