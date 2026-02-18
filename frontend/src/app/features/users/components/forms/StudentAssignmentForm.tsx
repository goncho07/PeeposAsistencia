import { useState, useMemo } from 'react';
import { Input, Badge, Select } from '@/app/components/ui/base';
import { Search, X, ChevronLeft, ChevronRight, GraduationCap, User } from 'lucide-react';
import { Student } from '@/lib/api/users';

const PER_PAGE = 8;

const LEVEL_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'INICIAL', label: 'Inicial' },
  { value: 'PRIMARIA', label: 'Primaria' },
  { value: 'SECUNDARIA', label: 'Secundaria' },
];

interface StudentAssignmentFormProps {
  students: Student[];
  selectedStudentIds: number[];
  onToggleStudent: (id: number) => void;
}

export function StudentAssignmentForm({
  students,
  selectedStudentIds,
  onToggleStudent,
}: StudentAssignmentFormProps) {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [page, setPage] = useState(1);

  const selectedStudents = useMemo(
    () => students.filter((s) => selectedStudentIds.includes(s.id)),
    [students, selectedStudentIds]
  );

  const filtered = useMemo(() => {
    let result = students;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.full_name?.toLowerCase().includes(q) ||
          s.student_code?.toLowerCase().includes(q) ||
          s.document_number?.toLowerCase().includes(q)
      );
    }
    if (levelFilter) {
      result = result.filter((s) => s.classroom?.level === levelFilter);
    }
    return result;
  }, [students, search, levelFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-4">
      {selectedStudents.length > 0 && (
        <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 animate-in fade-in slide-in-from-top-2">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            {selectedStudents.length} Estudiante{selectedStudents.length !== 1 ? 's' : ''} seleccionado{selectedStudents.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedStudents.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onToggleStudent(s.id)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-text-primary border border-primary/20 hover:border-danger hover:text-danger transition-all shadow-sm text-sm group"
              >
                <span className="font-medium">{s.full_name}</span>
                <X className="w-4 h-4 text-text-secondary group-hover:text-danger" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, código o documento..."
            value={search}
            onChange={(v) => { setSearch(v); resetPage(); }}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <Select
          value={levelFilter}
          onChange={(val) => {
            setLevelFilter(String(val));
            resetPage();
          }}
          options={LEVEL_OPTIONS}
          className="sm:w-48"
        />
      </div>

      <p className="text-sm text-text-secondary">
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        {(search || levelFilter) ? ` de ${students.length}` : ''}
      </p>

      <div className="space-y-1.5">
        {paginated.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <GraduationCap className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p className="text-xl">No se encontraron estudiantes</p>
          </div>
        ) : (
          paginated.map((student) => {
            const isSelected = selectedStudentIds.includes(student.id);
            return (
              <div
                key={student.id}
                onClick={() => onToggleStudent(student.id)}
                className={`
                  flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150
                  ${isSelected
                    ? 'bg-primary/5 border-primary ring-1 ring-primary/20'
                    : 'bg-surface border-border hover:border-primary/40'
                  }
                `}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-background border border-border shrink-0">
                  {student.photo_url ? (
                    <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-text-secondary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-xl text-text-primary truncate">{student.full_name}</p>
                    {student.enrollment_status && (
                      <Badge
                        variant={student.enrollment_status === 'MATRICULADO' ? 'success' : 'secondary'}
                        size="md"
                      >
                        {student.enrollment_status === 'MATRICULADO' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-base text-text-secondary">
                    {student.student_code && <span>{student.student_code}</span>}
                    {student.classroom && (
                      <>
                        <span className="opacity-40">·</span>
                        <span>{student.classroom.full_name}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className={`
                  w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors
                  ${isSelected ? 'bg-primary border-primary' : 'border-border'}
                `}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-lg border border-border bg-surface text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/5 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <span className="text-sm text-text-secondary">
            Página {safePage} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-lg border border-border bg-surface text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/5 transition-colors"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
