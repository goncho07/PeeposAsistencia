import { User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Person } from '../../hooks/usePersonSearch';
import { getStorageUrl } from '@/lib/axios';

interface PersonListProps {
  persons: Person[];
  onSelect: (person: Person) => void;
  selectedPerson: Person | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PersonList({
  persons,
  onSelect,
  selectedPerson,
  currentPage,
  totalPages,
  onPageChange,
}: PersonListProps) {
  const getPhotoUrl = (person: Person) => {
    if ('photo_url' in person && person.photo_url) {
      return getStorageUrl(person.photo_url);
    }
    return null;
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getPersonDetail = (person: Person) => {
    if ('document_number' in person && person.document_number) {
      if (person.type === 'user' && 'role' in person) {
        return `${person.role} · DNI: ${person.document_number}`;
      }
      return `DNI: ${person.document_number}`;
    }
    return '';
  };

  if (persons.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-full bg-border/10 flex items-center justify-center mx-auto mb-4">
          <User className="w-20 h-20 text-text-secondary" />
        </div>
        <p className="text-3xl text-text-secondary">
          No se encontraron resultados
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2 max-h-[500px] overflow-y-auto pr-2">
        {persons.map((person) => {
          const photoUrl = getPhotoUrl(person);
          const isSelected = selectedPerson?.id === person.id;

          return (
            <button
              key={`${person.type}-${person.id}`}
              onClick={() => onSelect(person)}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 text-left
                 ${isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface text-text-primary hover:border-primary hover:bg-surface-hover hover:text-primary'
                }`}
            >

              <div className="shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={person.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-border dark:border-border-dark"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border dark:border-border-dark">
                    <span className="text-xl font-bold text-primary dark:text-primary-light">
                      {getInitials(person.full_name)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xl text-text-primary truncate">
                  {person.full_name}
                </h3>
                <p className="text-md text-text-secondary">
                  {getPersonDetail(person)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border dark:border-border-dark">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary dark:hover:border-primary-light transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary dark:hover:border-primary-light transition-colors"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
