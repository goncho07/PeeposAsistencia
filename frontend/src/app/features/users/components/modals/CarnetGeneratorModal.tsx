'use client';
import { Modal, Button } from '@/app/components/ui/base';
import { CarnetFiltersForm } from '../carnets/CarnetFilters';
import { JobStatus } from '../carnets/JobStatus';
import { useCarnetGenerator } from '../../hooks/useCarnetGenerator';
import { Classroom } from '@/lib/api/users';
import { CreditCard, AlertCircle, FileText } from 'lucide-react';

interface CarnetGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (message: string) => void;
    classrooms: Classroom[];
}

export function CarnetGeneratorModal({
    isOpen,
    onClose,
    onSuccess,
    classrooms,
}: CarnetGeneratorModalProps) {
    const {
        filters,
        setFilters,
        progress,
        totalUsers,
        error,
        isGenerating,
        showSuccessScreen,
        allowedTypes,
        availableLevels,
        availableGrades,
        availableSections,
        canGenerate,
        isJobRunning,
        handleGenerate,
        handleCloseAttempt,
    } = useCarnetGenerator(isOpen, classrooms, onSuccess, onClose);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleCloseAttempt}
            title="Generador de Carnets"
            size="md"
            closeOnOverlayClick={!isJobRunning && !showSuccessScreen}
            footer={
                !showSuccessScreen &&
                !isJobRunning && (
                    <>
                        <Button
                            variant="outline"
                            onClick={handleCloseAttempt}
                            disabled={isGenerating}
                            className='text-xl'
                        >
                            Cancelar
                        </Button>
                        {canGenerate && (
                            <Button
                                variant="primary"
                                onClick={handleGenerate}
                                loading={isGenerating}
                                icon={<CreditCard className="w-4 h-4" />}
                                className='text-xl'
                            >
                                Generar Carnets
                            </Button>
                        )}
                    </>
                )
            }
        >
            {showSuccessScreen || isJobRunning ? (
                <JobStatus
                    progress={progress}
                    totalUsers={totalUsers}
                    showSuccessScreen={showSuccessScreen}
                />
            ) : (
                <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                        <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                            <FileText className="w-5 h-5 text-primary dark:text-primary-light" />
                        </div>
                        <div>
                            <h3 className="font-medium text-xl text-text-primary dark:text-text-primary-dark">
                                Generación de Carnets PDF
                            </h3>
                            <p className="text-base text-text-secondary dark:text-text-secondary-dark mt-1">
                                Selecciona los filtros para generar los carnets. El archivo PDF se descargará automáticamente.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl flex items-start gap-3 bg-danger/10 border border-danger/30">
                            <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-danger">Error en la generación</p>
                                <p className="text-base text-danger/80 mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    <CarnetFiltersForm
                        filters={filters}
                        onChange={setFilters}
                        allowedTypes={allowedTypes}
                        availableLevels={availableLevels}
                        availableGrades={availableGrades}
                        availableSections={availableSections}
                    />
                </div>
            )}
        </Modal>
    );
}
