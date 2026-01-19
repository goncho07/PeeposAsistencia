'use client';

import { useState } from 'react';
import { ArrowLeft, XCircle, LogIn, LogOut } from 'lucide-react';
import { Modal, Button } from '@/app/components/ui/base';
import { usePersonSearch, Person } from '../hooks/usePersonSearch';
import { useScanner } from '../hooks/useScanner';
import { PersonSearchBar } from './shared/PersonSearchBar';
import { PersonList } from './shared/PersonList';
import { ScanResult } from './shared/ScanResult';
import { getStorageUrl } from '@/lib/axios';

interface ManualScannerProps {
  scanType: 'entry' | 'exit';
  onBack: () => void;
}

function ManualScannerSkeleton() {
  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <div className="w-10 h-10 rounded-full bg-surface dark:bg-surface-dark animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-40 bg-surface dark:bg-surface-dark rounded animate-pulse" />
          <div className="h-4 w-32 bg-surface dark:bg-surface-dark rounded animate-pulse" />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="max-w-4xl w-full mx-auto flex flex-col flex-1 min-h-0">
          <div className="shrink-0 mb-4">
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-surface dark:bg-surface-dark rounded-xl animate-pulse" />
              <div className="w-32 h-12 bg-surface dark:bg-surface-dark rounded-xl animate-pulse" />
            </div>
          </div>

          <div className="flex-1 min-h-0 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-4 rounded-lg border-2 border-border dark:border-border-dark bg-surface dark:bg-surface-dark"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-background dark:bg-background-dark animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 bg-background dark:bg-background-dark rounded animate-pulse" />
                    <div className="h-4 w-32 bg-background dark:bg-background-dark rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  person: Person | null;
  scanType: 'entry' | 'exit';
  loading: boolean;
}

function ConfirmModal({ isOpen, onClose, onConfirm, person, scanType, loading }: ConfirmModalProps) {
  if (!person) return null;

  const getPhotoUrl = () => {
    if (person.type === 'student' && 'photo_url' in person && person.photo_url) {
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

  const photoUrl = getPhotoUrl();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Confirmar ${scanType === 'entry' ? 'Entrada' : 'Salida'}`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={onConfirm}
            loading={loading}
            icon={scanType === 'entry' ? <LogIn size={18} /> : <LogOut size={18} />}
          >
            Confirmar {scanType === 'entry' ? 'Entrada' : 'Salida'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center py-4">
        <div className="mb-4">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={person.full_name}
              className="w-24 h-24 rounded-full object-cover border-4 border-border dark:border-border-dark"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-border dark:border-border-dark">
              <span className="text-2xl font-bold text-primary dark:text-primary-light">
                {getInitials(person.full_name)}
              </span>
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-1">
          {person.full_name}
        </h3>

        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-4">
          {person.type === 'student' && 'student_code' in person
            ? `Código: ${person.student_code}`
            : person.type === 'teacher' && 'dni' in person
            ? `DNI: ${person.dni}`
            : ''}
        </p>

        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            scanType === 'entry'
              ? 'bg-success/10 text-success'
              : 'bg-warning/10 text-warning'
          }`}
        >
          {scanType === 'entry' ? <LogIn size={16} /> : <LogOut size={16} />}
          Registrar {scanType === 'entry' ? 'Entrada' : 'Salida'}
        </div>
      </div>
    </Modal>
  );
}

export function ManualScanner({ scanType, onBack }: ManualScannerProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    currentPage,
    setCurrentPage,
    isLoading,
    error: loadError,
    paginatedPersons,
    totalPages,
  } = usePersonSearch();

  const { result, error, isProcessing, scan } = useScanner(scanType);

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    setShowConfirmModal(true);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setSelectedPerson(null);
  };

  const handleConfirmScan = async () => {
    if (!selectedPerson) return;

    const qrCode = selectedPerson.qr_code;

    // Close modal immediately
    setShowConfirmModal(false);
    setSelectedPerson(null);

    await scan(qrCode, () => {
      setSearchQuery('');
    });
  };

  if (isLoading) {
    return <ManualScannerSkeleton />;
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-danger" />
          <p className="text-xl font-bold mb-2 text-text-primary dark:text-text-primary-dark">
            Error al cargar datos
          </p>
          <p className="text-text-secondary dark:text-text-secondary-dark">
            {loadError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <button
          onClick={onBack}
          className="rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={20} className="text-text-primary dark:text-text-primary-dark" />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Búsqueda Manual
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
            {scanType === 'entry' ? 'Registrando Entrada' : 'Registrando Salida'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="max-w-4xl w-full mx-auto flex flex-col flex-1 min-h-0">
          <div className="shrink-0">
            <PersonSearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
          </div>

          <div className="flex-1 min-h-0 overflow-auto">
            <PersonList
              persons={paginatedPersons}
              onSelect={handleSelectPerson}
              selectedPerson={null}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmScan}
        person={selectedPerson}
        scanType={scanType}
        loading={isProcessing}
      />

      <ScanResult result={result} error={error} />
    </div>
  );
}
