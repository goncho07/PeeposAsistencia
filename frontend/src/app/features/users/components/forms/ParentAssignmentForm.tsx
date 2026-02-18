import { useState, useMemo } from 'react';
import { Input } from '@/app/components/ui/base';
import { Search, X, ChevronLeft, ChevronRight, Users, User, Phone } from 'lucide-react';
import { Parent } from '@/lib/api/users';

const PER_PAGE = 8;

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface ParentAssignmentFormProps {
  parents: Parent[];
  selectedParentIds: number[];
  onToggleParent: (id: number) => void;
}

export function ParentAssignmentForm({
  parents,
  selectedParentIds,
  onToggleParent,
}: ParentAssignmentFormProps) {
  const [search, setSearch] = useState('');
  const [letterFilter, setLetterFilter] = useState('');
  const [page, setPage] = useState(1);

  const selectedParents = useMemo(
    () => parents.filter((p) => selectedParentIds.includes(p.id)),
    [parents, selectedParentIds]
  );

  // Letters that actually have parents
  const activeLetters = useMemo(() => {
    const set = new Set<string>();
    parents.forEach((p) => {
      const first = (p.paternal_surname || p.full_name || '').charAt(0).toUpperCase();
      if (first) set.add(first);
    });
    return set;
  }, [parents]);

  const filtered = useMemo(() => {
    let result = parents;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(q) ||
          p.document_number?.toLowerCase().includes(q) ||
          p.phone_number?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q)
      );
    }
    if (letterFilter) {
      result = result.filter((p) => {
        const first = (p.paternal_surname || p.full_name || '').charAt(0).toUpperCase();
        return first === letterFilter;
      });
    }
    return result;
  }, [parents, search, letterFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-4">
      {selectedParents.length > 0 && (
        <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 animate-in fade-in slide-in-from-top-2">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            {selectedParents.length} Estudiante{selectedParents.length !== 1 ? 's' : ''} seleccionado{selectedParents.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedParents.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onToggleParent(p.id)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-text-primary border border-primary/20 hover:border-danger hover:text-danger transition-all shadow-sm text-sm group"
              >
                <span className="font-medium">{p.full_name}</span>
                <X className="w-4 h-4 text-text-secondary group-hover:text-danger" />
              </button>
            ))}
          </div>
        </div>
      )}

      <Input
        placeholder="Buscar por nombre, documento, teléfono o email..."
        value={search}
        onChange={(v) => { setSearch(v); resetPage(); }}
        icon={<Search className="w-5 h-5" />}
      />

      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => { setLetterFilter(''); resetPage(); }}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            !letterFilter
              ? 'bg-primary text-white'
              : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary/40'
          }`}
        >
          Todos
        </button>
        {ALPHABET.map((letter) => {
          const hasItems = activeLetters.has(letter);
          return (
            <button
              key={letter}
              type="button"
              disabled={!hasItems}
              onClick={() => { setLetterFilter(letter === letterFilter ? '' : letter); resetPage(); }}
              className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                letter === letterFilter
                  ? 'bg-primary text-white'
                  : hasItems
                    ? 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary/40'
                    : 'text-text-secondary/30 cursor-not-allowed'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <p className="text-sm text-text-secondary">
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        {(search || letterFilter) ? ` de ${parents.length}` : ''}
      </p>

      <div className="space-y-1.5">
        {paginated.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <Users className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p className="text-xl">No se encontraron apoderados</p>
          </div>
        ) : (
          paginated.map((parent) => {
            const isSelected = selectedParentIds.includes(parent.id);
            return (
              <div
                key={parent.id}
                onClick={() => onToggleParent(parent.id)}
                className={`
                  flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150
                  ${isSelected
                    ? 'bg-primary/5 border-primary ring-1 ring-primary/20'
                    : 'bg-surface border-border hover:border-primary/40'
                  }
                `}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-background border border-border shrink-0">
                  {parent.photo_url ? (
                    <img src={parent.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-text-secondary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xl text-text-primary truncate">{parent.full_name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-base text-text-secondary">
                    <span>{parent.document_type?.toUpperCase()}: {parent.document_number}</span>
                    {parent.phone_number && (
                      <>
                        <span className="opacity-40">·</span>
                        <span className="inline-flex items-center gap-0.5">
                          <Phone className="w-3 h-3" />
                          {parent.phone_number}
                        </span>
                      </>
                    )}
                    {parent.email && (
                      <>
                        <span className="opacity-40">·</span>
                        <span className="truncate max-w-[140px]">{parent.email}</span>
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
