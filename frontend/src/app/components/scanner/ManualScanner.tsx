'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { scannerService, ScanResponse } from '@/lib/api/scanner';
import { Student, Teacher, usersService } from '@/lib/api/users';
import { CheckCircle2, XCircle, Loader2, Search, User, GraduationCap, Users, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStorageUrl } from '@/lib/axios';

interface ManualScannerProps {
  scanType: 'entry' | 'exit';
  onBack: () => void;
}

type PersonType = 'student' | 'teacher';
type Person = (Student | Teacher) & { type: PersonType };

const ITEMS_PER_PAGE = 20;

export function ManualScanner({ scanType, onBack }: ManualScannerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PersonType>('student');
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const hasLoadedData = useRef(false);

  useEffect(() => {
    if (!hasLoadedData.current) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [studentsData, teachersData] = await Promise.all([
        usersService.getStudents(),
        usersService.getTeachers()
      ]);
      setStudents(studentsData);
      setTeachers(teachersData);
      setLoadError(null);
      hasLoadedData.current = true;
    } catch (err) {
      console.error('Error cargando datos:', err);
      setLoadError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPersons = useMemo(() => {
    const data: Person[] = selectedType === 'student'
      ? students.map(s => ({ ...s, type: 'student' as PersonType }))
      : teachers.map(t => ({ ...t, type: 'teacher' as PersonType }));

    if (!searchQuery.trim()) {
      return data;
    }

    const query = searchQuery.toLowerCase();
    return data.filter(person => {
      const fullName = person.full_name.toLowerCase();
      const dni = 'dni' in person ? person.dni?.toLowerCase() : '';
      const documentNumber = 'document_number' in person ? person.document_number?.toLowerCase() : '';
      const studentCode = 'student_code' in person ? person.student_code?.toLowerCase() : '';

      return (
        fullName.includes(query) ||
        dni?.includes(query) ||
        documentNumber?.includes(query) ||
        studentCode?.includes(query)
      );
    });
  }, [searchQuery, selectedType, students, teachers]);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  const totalPages = Math.ceil(filteredPersons.length / ITEMS_PER_PAGE);
  const paginatedPersons = filteredPersons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleClickPerson = (person: Person) => {
    setSelectedPerson(person);
  };

  const handleConfirmScan = async () => {
    if (!selectedPerson) return;

    try {
      setIsProcessing(true);
      setError(null);
      setResult(null);

      const response = scanType === 'entry'
        ? await scannerService.scanEntry(selectedPerson.qr_code)
        : await scannerService.scanExit(selectedPerson.qr_code);

      setResult(response);
      setSelectedPerson(null);

      setTimeout(() => {
        setResult(null);
        setIsProcessing(false);
        setSearchQuery('');
      }, 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar el registro');
      setSelectedPerson(null);
      setIsProcessing(false);

      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleCancelConfirm = () => {
    setSelectedPerson(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" style={{ color: 'var(--color-primary)' }} />
          <p className="text-xl" style={{ color: 'var(--color-text-primary)' }}>Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-danger)' }} />
          <p className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Error al cargar datos</p>
          <p style={{ color: 'var(--color-text-secondary)' }}>{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-y-auto" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="p-12">
      <motion.button
        onClick={onBack}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-6 left-10 rounded-full w-12 h-12 flex items-center justify-center shadow-md z-50 transition-all"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <ArrowLeft size={24} style={{ color: 'var(--color-text-primary)' }} />
      </motion.button>

      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Búsqueda Manual
        </h2>
        <p className="text-base md:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          {scanType === 'entry' ? 'Registrando Entrada' : 'Registrando Salida'}
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setSelectedType('student')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all border-2 ${
            selectedType === 'student' ? '' : 'opacity-60'
          }`}
          style={{
            backgroundColor: selectedType === 'student' ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)' : 'var(--color-surface)',
            borderColor: selectedType === 'student' ? 'var(--color-primary)' : 'var(--color-border)',
            color: selectedType === 'student' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
          }}
        >
          <GraduationCap size={20} />
          <span className="hidden sm:inline">Estudiantes ({students.length})</span>
          <span className="sm:hidden">{students.length}</span>
        </button>
        <button
          onClick={() => setSelectedType('teacher')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all border-2 ${
            selectedType === 'teacher' ? '' : 'opacity-60'
          }`}
          style={{
            backgroundColor: selectedType === 'teacher' ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)' : 'var(--color-surface)',
            borderColor: selectedType === 'teacher' ? 'var(--color-primary)' : 'var(--color-border)',
            color: selectedType === 'teacher' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
          }}
        >
          <Users size={20} />
          <span className="hidden sm:inline">Docentes ({teachers.length})</span>
          <span className="sm:hidden">{teachers.length}</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={20} style={{ color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar por nombre, DNI${selectedType === 'student' ? ', código' : ''}...`}
            className="w-full pl-10 pr-4 py-3 rounded-lg border transition-all text-sm md:text-base"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)'
            }}
            autoFocus
          />
        </div>
        <p className="text-xs md:text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
          Resultados: {filteredPersons.length} | Mostrando: {paginatedPersons.length}
        </p>
      </div>

      {/* Lista de personas */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {paginatedPersons.length === 0 ? (
          <div className="text-center py-12 card">
            <User size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }} />
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              No se encontraron resultados
            </p>
          </div>
        ) : (
          paginatedPersons.map((person) => (
            <motion.button
              key={`${person.type}-${person.id}`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleClickPerson(person)}
              disabled={isProcessing}
              className="card p-3 md:p-4 text-left disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 md:gap-4 transition-all"
            >
              <div className="shrink-0">
                {person.photo_url ? (
                  <img
                    src={getStorageUrl(person.photo_url)}
                    alt={person.full_name}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2"
                    style={{ borderColor: 'var(--color-border)' }}
                  />
                ) : (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center"
                       style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
                    <User size={24} style={{ color: 'var(--color-text-secondary)' }} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {person.full_name}
                </h3>
                <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
                  {'dni' in person && person.dni && (
                    <span className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                            color: 'var(--color-primary)'
                          }}>
                      DNI: {person.dni}
                    </span>
                  )}
                  {'student_code' in person && person.student_code && (
                    <span className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                            color: 'var(--color-primary)'
                          }}>
                      Código: {person.student_code}
                    </span>
                  )}
                  {'classroom' in person && person.classroom && (
                    <span className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--color-secondary) 15%, transparent)',
                            color: 'var(--color-secondary)'
                          }}>
                      {person.classroom.full_name}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                {person.type === 'student' ? (
                  <GraduationCap size={20} style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <Users size={20} style={{ color: 'var(--color-secondary)' }} />
                )}
              </div>
            </motion.button>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between card p-3 md:p-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 flex items-center gap-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 flex items-center gap-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)'
            }}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Modal de confirmación */}
      <AnimatePresence>
        {selectedPerson && !isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={handleCancelConfirm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="card rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                       style={{
                         backgroundColor: scanType === 'entry'
                           ? 'rgba(34, 197, 94, 0.15)'
                           : 'rgba(249, 115, 22, 0.15)'
                       }}>
                    {scanType === 'entry' ? (
                      <span className="text-4xl">🟢</span>
                    ) : (
                      <span className="text-4xl">🔴</span>
                    )}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    ¿Confirmar {scanType === 'entry' ? 'Entrada' : 'Salida'}?
                  </h3>
                  <p className="text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                    Verifica que la persona sea correcta
                  </p>
                </div>

                <div className="rounded-2xl p-4 mb-6" style={{ backgroundColor: 'var(--color-background)' }}>
                  <div className="flex items-center gap-4">
                    <div className="shrink-0">
                      {selectedPerson.photo_url ? (
                        <img
                          src={getStorageUrl(selectedPerson.photo_url)}
                          alt={selectedPerson.full_name}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4"
                          style={{ borderColor: 'var(--color-primary)' }}
                        />
                      ) : (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4"
                             style={{
                               backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                               borderColor: 'var(--color-primary)'
                             }}>
                          <User size={32} style={{ color: 'var(--color-primary)' }} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg md:text-xl font-bold mb-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {selectedPerson.full_name}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {'dni' in selectedPerson && selectedPerson.dni && (
                          <span className="text-xs px-2 py-1 rounded font-medium"
                                style={{
                                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                                  color: 'var(--color-primary)'
                                }}>
                            DNI: {selectedPerson.dni}
                          </span>
                        )}
                        {'student_code' in selectedPerson && selectedPerson.student_code && (
                          <span className="text-xs px-2 py-1 rounded font-medium"
                                style={{
                                  backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)',
                                  color: 'var(--color-primary)'
                                }}>
                            {selectedPerson.student_code}
                          </span>
                        )}
                      </div>
                      {'classroom' in selectedPerson && selectedPerson.classroom && (
                        <p className="text-sm mt-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                          📚 {selectedPerson.classroom.full_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelConfirm}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-base transition-all border-2"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmScan}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-base transition-all shadow-lg"
                    style={{
                      background: scanType === 'entry'
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: 'white'
                    }}
                  >
                    ✓ Confirmar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de resultado */}
      <AnimatePresence>
        {(result || error) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
            onClick={() => {
              setResult(null);
              setError(null);
              setIsProcessing(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-8 md:p-10 max-w-md w-full text-center"
            >
              {result && (
                <>
                  <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6" style={{ color: 'var(--color-success)' }} />
                  <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {result.person.full_name}
                  </h3>
                  <p className="text-lg md:text-xl font-semibold mb-6" style={{ color: 'var(--color-success)' }}>
                    {result.message}
                  </p>
                  {result.person.photo_url && (
                    <img
                      src={getStorageUrl(result.person.photo_url)}
                      alt={result.person.full_name}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full mx-auto object-cover border-4"
                      style={{ borderColor: 'var(--color-success)' }}
                    />
                  )}
                </>
              )}

              {error && (
                <>
                  <XCircle className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6" style={{ color: 'var(--color-danger)' }} />
                  <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Error</h3>
                  <p className="text-base md:text-lg" style={{ color: 'var(--color-danger)' }}>{error}</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
