'use client';
import { useEffect, useState } from 'react';
import { classroomService, Classroom, BulkClassroomData } from '@/lib/api/classrooms';
import { Button, Input, Select } from '@/app/components/ui/base';
import {
  Plus,
  Trash2,
  Users,
  Wand2,
  X,
  School,
} from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';

type Level = 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';

const LEVEL_CONFIG: Record<Level, { icon: typeof School; label: string; accent: string; accentBg: string; accentBorder: string }> = {
  INICIAL: { icon: School, label: 'Inicial', accent: 'text-blue-500', accentBg: 'bg-blue-500/10', accentBorder: 'border-blue-500/20' },
  PRIMARIA: { icon: School, label: 'Primaria', accent: 'text-emerald-500', accentBg: 'bg-emerald-500/10', accentBorder: 'border-emerald-500/20' },
  SECUNDARIA: { icon: School, label: 'Secundaria', accent: 'text-violet-500', accentBg: 'bg-violet-500/10', accentBorder: 'border-violet-500/20' },
};

export function TenantClassroomsTab() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [bulkData, setBulkData] = useState<BulkClassroomData>({
    level: 'PRIMARIA',
    grades: [],
    sections: 'ABC',
    capacity: 30,
  });
  const [bulkCreating, setBulkCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['PRIMARIA', 'SECUNDARIA']));

  useEffect(() => {
    loadClassrooms();
  }, []);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const loadClassrooms = async () => {
    try {
      const data = await classroomService.getAll();
      setClassrooms(data);
    } catch (error) {
      console.error('Error loading classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    if (bulkData.grades.length === 0 || !bulkData.sections.trim()) {
      setMessage({ type: 'error', text: 'Selecciona al menos un grado y escribe las secciones' });
      return;
    }

    setBulkCreating(true);
    setMessage(null);

    try {
      const result = await classroomService.bulkCreate(bulkData);
      setMessage({ type: 'success', text: result.message });
      setShowBulkCreate(false);
      setBulkData({ level: 'PRIMARIA', grades: [], sections: 'ABC', capacity: 30 });
      await loadClassrooms();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al crear aulas',
      });
    } finally {
      setBulkCreating(false);
    }
  };

  const handleDelete = async (classroom: Classroom) => {
    if (!confirm(`¿Eliminar el aula ${classroom.full_name}?`)) return;

    setDeletingId(classroom.id);
    try {
      await classroomService.delete(classroom.id);
      setClassrooms((prev) => prev.filter((c) => c.id !== classroom.id));
      setMessage({ type: 'success', text: 'Aula eliminada' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al eliminar aula',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleGrade = (grade: number) => {
    setBulkData((prev) => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter((g) => g !== grade)
        : [...prev.grades, grade].sort(),
    }));
  };

  const groupedClassrooms = classrooms.reduce((acc, classroom) => {
    if (!acc[classroom.level]) {
      acc[classroom.level] = [];
    }
    acc[classroom.level].push(classroom);
    return acc;
  }, {} as Record<string, Classroom[]>);

  const levelOrder: Level[] = ['INICIAL', 'PRIMARIA', 'SECUNDARIA'];
  const gradesByLevel: Record<Level, number[]> = {
    INICIAL: [3, 4, 5],
    PRIMARIA: [1, 2, 3, 4, 5, 6],
    SECUNDARIA: [1, 2, 3, 4, 5],
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 bg-background flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-card animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-28 bg-card animate-pulse rounded" />
                <div className="h-4 w-44 bg-card animate-pulse rounded" />
              </div>
            </div>
            <div className="px-4 pb-4 pt-2 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="rounded-xl border border-border bg-surface p-4 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-card animate-pulse" />
                      <div className="space-y-1.5">
                        <div className="h-5 w-20 bg-card animate-pulse rounded" />
                        <div className="h-3.5 w-28 bg-card animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="h-4 w-16 bg-card animate-pulse rounded" />
                      <div className="h-1.5 w-full bg-card animate-pulse rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium border flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-success/10 text-success border-success/20'
              : 'bg-danger/10 text-danger border-danger/20'
          }`}
        >
          {message.text}
          <button onClick={() => setMessage(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {classrooms.length === 0 ? (
        <div className="text-center py-12 bg-background rounded-xl border border-border">
          <School size={48} className="mx-auto text-text-tertiary mb-3" />
          <p className="text-xl text-text-secondary">No hay aulas registradas</p>
          <p className="text-lg text-text-tertiary mt-1">Usa el generador para crear aulas rápidamente</p>
        </div>
      ) : (
        levelOrder.map((level) => {
          const levelClassrooms = groupedClassrooms[level] || [];
          if (levelClassrooms.length === 0) return null;

          const config = LEVEL_CONFIG[level];
          const totalStudents = levelClassrooms.reduce((sum, c) => sum + c.students_count, 0);

          return (
            <CollapsibleSection
              key={level}
              icon={config.icon}
              title={config.label}
              summary={`${levelClassrooms.length} aulas · ${totalStudents} estudiantes`}
              isOpen={openSections.has(level)}
              onToggle={() => toggleSection(level)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {levelClassrooms.map((classroom) => {
                  const canDelete = classroom.students_count === 0;
                  const isDeleting = deletingId === classroom.id;
                  const fillPercent = classroom.capacity
                    ? Math.min((classroom.students_count / classroom.capacity) * 100, 100)
                    : 0;

                  return (
                    <div
                      key={classroom.id}
                      className={`group rounded-xl border ${config.accentBorder} bg-surface p-4 transition-all hover:shadow-sm`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 rounded-lg ${config.accentBg} flex items-center justify-center shrink-0`}>
                            <School size={20} className={config.accent} />
                          </div>
                          <div>
                            <p className="font-semibold text-xl text-text-primary">
                              {classroom.full_name}
                            </p>
                            {classroom.tutor && (
                              <p className="text-sm text-text-secondary mt-0.5">
                                {classroom.tutor.name}
                              </p>
                            )}
                          </div>
                        </div>

                        {canDelete && (
                          <button
                            onClick={() => handleDelete(classroom)}
                            disabled={isDeleting}
                            className="cursor-pointer p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-danger hover:bg-danger/10 transition-all"
                            title="Eliminar aula"
                          >
                            {isDeleting ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg text-text-secondary flex items-center gap-1.5">
                            <Users size={20} className={config.accent} />
                            {classroom.students_count}
                            {classroom.capacity ? ` / ${classroom.capacity}` : ''}
                          </span>
                          {classroom.shift && (
                            <span className="text-lg px-2 py-0.5 rounded-lg bg-background text-text-secondary">
                              {classroom.shift}
                            </span>
                          )}
                        </div>
                        {classroom.capacity > 0 && (
                          <div className="w-full h-1.5 rounded-full bg-background overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                fillPercent >= 90 ? 'bg-danger' : fillPercent >= 70 ? 'bg-warning' : 'bg-success'
                              }`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          );
        })
      )}

      {showBulkCreate && (
        <div className="border border-primary/30 rounded-xl p-5 bg-primary/5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-semibold text-text-primary">Generador de Aulas</h4>
            <button
              onClick={() => setShowBulkCreate(false)}
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Nivel"
              value={bulkData.level}
              onChange={(v) => setBulkData((prev) => ({ ...prev, level: v as Level, grades: [] }))}
              options={[
                { value: 'INICIAL', label: 'Inicial' },
                { value: 'PRIMARIA', label: 'Primaria' },
                { value: 'SECUNDARIA', label: 'Secundaria' },
              ]}
            />

            <div>
              <label className="block text-xl font-medium text-text-primary mb-2">
                Grados
              </label>
              <div className="flex flex-wrap gap-2">
                {gradesByLevel[bulkData.level].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => toggleGrade(grade)}
                    className={`cursor-pointer px-3 py-1.5 rounded-lg text-lg font-medium transition-colors ${bulkData.grades.includes(grade)
                        ? 'bg-primary text-white'
                        : 'bg-surface border border-border text-text-secondary hover:border-primary'
                      }`}
                  >
                    {bulkData.level === 'INICIAL' ? `${grade} años` : `${grade}°`}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Secciones (letras sin separador)"
              value={bulkData.sections}
              onChange={(v) => setBulkData((prev) => ({ ...prev, sections: v.toUpperCase() }))}
              placeholder="ABC"
            />

            <Input
              label="Capacidad por aula"
              type="number"
              value={bulkData.capacity?.toString() || '30'}
              onChange={(v) => setBulkData((prev) => ({ ...prev, capacity: parseInt(v) || 30 }))}
            />
          </div>

          <div className="p-3 bg-surface rounded-xl text-lg text-text-secondary border border-border">
            Se crearán <strong>{bulkData.grades.length * (bulkData.sections.trim().length || 0)}</strong> aulas
            ({bulkData.grades.length} grados × {bulkData.sections.trim().length || 0} secciones)
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowBulkCreate(false)} className="text-xl">
              Cancelar
            </Button>
            <Button
              variant="primary"
              icon={<Plus size={18} />}
              onClick={handleBulkCreate}
              loading={bulkCreating}
              disabled={bulkData.grades.length === 0 || !bulkData.sections.trim()}
              className="text-xl"
            >
              Crear Aulas
            </Button>
          </div>
        </div>
      )}
      
      <div className="pt-4 border-t border-border">
        <Button
          variant="primary"
          icon={<Wand2 size={20} />}
          onClick={() => setShowBulkCreate(true)}
          className="text-xl"
        >
          Abrir generador
        </Button>
      </div>
    </div>
  );
}
