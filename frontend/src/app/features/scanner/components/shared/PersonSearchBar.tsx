import { Search, User, GraduationCap } from 'lucide-react';
import { PersonType } from '../../hooks/usePersonSearch';

interface PersonSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: PersonType;
  onTypeChange: (type: PersonType) => void;
}

export function PersonSearchBar({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
}: PersonSearchBarProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary dark:text-text-secondary-dark" />
        <input
          type="text"
          placeholder="Buscar por nombre, DNI o código..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-border dark:border-border-dark bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark placeholder-text-secondary dark:placeholder-text-secondary-dark focus:outline-none focus:border-primary dark:focus:border-primary-light transition-colors"
          autoFocus
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onTypeChange('student')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            selectedType === 'student'
              ? 'bg-primary text-white'
              : 'bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark hover:border-primary dark:hover:border-primary-light'
          }`}
        >
          <User className="w-4 h-4" />
          Estudiantes
        </button>
        <button
          onClick={() => onTypeChange('teacher')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            selectedType === 'teacher'
              ? 'bg-primary text-white'
              : 'bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark hover:border-primary dark:hover:border-primary-light'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Docentes
        </button>
      </div>
    </div>
  );
}
