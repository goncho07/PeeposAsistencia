import React from 'react';
import { GraduationCap, Briefcase, Shield, User as UserIcon } from 'lucide-react';
import RoleFilterCard from '@/components/ui/RoleFilterCard';

const ROLE_COLORS = {
    'Estudiante': {
        icon: GraduationCap,
        colorClass: 'text-blue-600',
        activeColorClass: 'bg-blue-600',
    },
    'Docente': {
        icon: Briefcase,
        colorClass: 'text-purple-600',
        activeColorClass: 'bg-purple-600',
    },
    'Administrativo': {
        icon: Shield,
        colorClass: 'text-slate-600',
        activeColorClass: 'bg-slate-600',
    },
    'Apoderado': {
        icon: UserIcon,
        colorClass: 'text-orange-600',
        activeColorClass: 'bg-orange-500',
    },
};

interface UsersFiltersProps {
    counts: Record<string, number>;
    selectedType: string;
    onSelectType: (type: string) => void;
}

const UsersFilters: React.FC<UsersFiltersProps> = ({ counts, selectedType, onSelectType }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Object.entries(ROLE_COLORS).map(([type, config]) => (
                <RoleFilterCard
                    key={type}
                    type={type}
                    label={`${type}s`}
                    icon={config.icon}
                    colorClass={config.colorClass}
                    activeColorClass={config.activeColorClass}
                    count={counts[type]}
                    isActive={selectedType === type}
                    onClick={() => onSelectType(type)}
                />
            ))}
        </div>
    );
};

export default UsersFilters;