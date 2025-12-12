import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, Shield, User as UserIcon, BookOpen } from 'lucide-react';
import { UserProfile, isStudent, isTeacher, isParent, isAdmin } from '@/types/userTypes';

interface UserCardProps {
    user: UserProfile;
    onClick: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={onClick}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex flex-col items-center gap-3 mb-4">
                <div
                    className={`w-20 h-20 rounded-full ${user.avatarGradient} flex items-center justify-center text-2xl font-bold text-white shadow-md border-4 border-white dark:border-slate-700 group-hover:scale-105 transition-transform`}
                >
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <>
                            {(user.fullName.charAt(0) || '')}
                            {(user.fullName.split(' ')[1]?.charAt(0) || '')}
                        </>
                    )}
                </div>
                <div className="text-center">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {user.fullName}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mt-1">
                        {isStudent(user) ? `Código: ${user.studentCode}` : `DNI: ${user.dni}`}
                    </p>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg justify-center">
                    {isStudent(user) && <GraduationCap size={16} className="text-gray-400" />}
                    {isTeacher(user) && <Briefcase size={16} className="text-gray-400" />}
                    {isAdmin(user) && <Shield size={16} className="text-gray-400" />}
                    {isParent(user) && <UserIcon size={16} className="text-gray-400" />}
                    <span className="truncate font-medium">{user.headerLabel}</span>
                </div>

                {isStudent(user) && user.aulaInfo && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg justify-center">
                        <BookOpen size={14} />
                        <span className="font-medium">{user.aulaInfo.level}</span>
                    </div>
                )}

                {isTeacher(user) && user.aulasTutorizadas.length > 0 && (
                    <div className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg text-center">
                        <span className="font-medium">Tutoriza {user.aulasTutorizadas.length} aula(s)</span>
                    </div>
                )}

                {isParent(user) && user.children.length > 0 && (
                    <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg text-center">
                        <span className="font-medium">{user.children.length} hijo(s) registrado(s)</span>
                    </div>
                )}
            </div>

            <div className="flex justify-center border-t border-gray-100 dark:border-slate-700 pt-4">
                <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'ACTIVO'
                        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                >
                    {user.status}
                </span>
            </div>
        </motion.div>
    );
};

export default UserCard;