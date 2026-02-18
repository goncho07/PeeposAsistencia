'use client';

import { useState } from 'react';
import { ArrowLeft, LogIn, LogOut } from 'lucide-react';
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
          <div className="shrink-0 mb-6">
            <div className="flex gap-3">
              <div className="flex-1 h-15 bg-surface dark:bg-surface-dark rounded-xl animate-pulse" />
              <div className="w-32 h-15 bg-surface dark:bg-surface-dark rounded-xl animate-pulse" />
            </div>
          </div>

          <div className="flex-1 min-h-0 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-4 rounded-lg border-2 border-border dark:border-border-dark bg-surface dark:bg-surface-dark"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-background dark:bg-background-dark animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-6 w-50 bg-background dark:bg-background-dark rounded animate-pulse" />
                    <div className="h-5 w-34 bg-background dark:bg-background-dark rounded animate-pulse" />
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

  const photoUrl = getPhotoUrl();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Confirmar ${scanType === 'entry' ? 'Entrada' : 'Salida'}`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading} className="text-xl">
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={onConfirm}
            loading={loading}
            icon={scanType === 'entry' ? <LogIn size={22} /> : <LogOut size={22} />}
            className="text-xl"
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
              className="w-30 h-30 rounded-full object-cover border-4 border-border dark:border-border-dark"
            />
          ) : (
            <div className="w-30 h-30 rounded-full bg-primary/10 flex items-center justify-center border-4 border-border dark:border-border-dark">
              <span className="text-4xl font-bold text-primary dark:text-primary-light">
                {getInitials(person.full_name)}
              </span>
            </div>
          )}
        </div>

        <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-1">
          {person.full_name}
        </h3>

        <p className="text-base text-text-secondary dark:text-text-secondary-dark">
          {person.type === 'student' && 'student_code' in person
            ? `Aula: ${person.classroom?.full_name}`
            : person.type === 'user' && 'role' in person
            ? `${person.role} · DNI: ${'document_number' in person ? person.document_number : ''}`
            : 'document_number' in person && person.document_number
            ? `DNI: ${person.document_number}`
            : ''}
        </p>  
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
    allowedTypes,
    isLoading,
    paginatedPersons,
    totalPages,
  } = usePersonSearch();

  const { result, error, isProcessing, scan } = useScanner(scanType, 'MANUAL');

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    setShowConfirmModal(true);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setSelectedPerson(null);
  };

  const handleConfirmScan = async () => {
    if (!selectedPerson || !selectedPerson.qr_code) return;

    const qrCode = selectedPerson.qr_code;

    setShowConfirmModal(false);
    setSelectedPerson(null);

    await scan(qrCode, () => {
      setSearchQuery('');
    });
  };

  if (isLoading) {
    return <ManualScannerSkeleton />;
  }

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <button
          onClick={onBack}
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-md transition-all bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={28} className="text-text-primary dark:text-text-primary-dark" />
        </button>
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            Búsqueda Manual
          </h2>
          <p className="text-lg text-text-secondary dark:text-text-secondary-dark">
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
              allowedTypes={allowedTypes}
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

      <ScanResult result={result} error={error} scanType={scanType} />
    </div>
  );
}
