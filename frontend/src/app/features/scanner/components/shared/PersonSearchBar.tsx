import { Search, GraduationCap, Briefcase, UserCog } from 'lucide-react';
import { PersonType } from '../../hooks/usePersonSearch';
import type { AttendableType } from '@/lib/api/attendance';

const TYPE_CONFIG: Record<PersonType, { label: string; icon: React.ReactNode }> = {
  student: { label: 'Estudiantes', icon: <GraduationCap className="w-4 h-4" /> },
  teacher: { label: 'Docentes', icon: <Briefcase className="w-4 h-4" /> },
  user: { label: 'Personal', icon: <UserCog className="w-4 h-4" /> },
};

interface PersonSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: PersonType;
  onTypeChange: (type: PersonType) => void;
  allowedTypes: AttendableType[];
}

export function PersonSearchBar({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  allowedTypes,
}: PersonSearchBarProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <input
          type="text"
          placeholder="Buscar por nombre, DNI o código..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-border bg-background text-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary dark:focus:border-primary-light transition-colors"
          autoFocus
        />
      </div>

      {allowedTypes.length > 1 && (
        <div className="flex gap-2">
          {allowedTypes.map((type) => {
            const config = TYPE_CONFIG[type as PersonType];
            if (!config) return null;

            return (
              <button
                key={type}
                onClick={() => onTypeChange(type as PersonType)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  selectedType === type
                    ? 'bg-primary text-white'
                    : 'bg-surface text-text-primary border border-border hover:border-primary'
                }`}
              >
                {config.icon}
                {config.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
