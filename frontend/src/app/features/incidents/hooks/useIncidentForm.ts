import { useState, useEffect, useCallback } from 'react';
import {
  incidentsService,
  CreateIncidentData,
  UpdateIncidentData,
  Incident,
} from '@/lib/api/incidents';
import { usersService, Student } from '@/lib/api/users';

interface Classroom {
  id: number;
  full_name: string;
  level: string;
  grade: number;
  section: string;
  shift: string;
}

export function useIncidentForm(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos del formulario
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<number | null>(null);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        setIsLoadingClassrooms(true);
        const data = await usersService.getClassrooms();
        setClassrooms(data || []);
      } catch (err) {
        console.error('Error loading classrooms:', err);
      } finally {
        setIsLoadingClassrooms(false);
      }
    };
    loadClassrooms();
  }, []);

  useEffect(() => {
    if (!selectedClassroom) {
      setStudents([]);
      return;
    }

    const loadStudents = async () => {
      try {
        setIsLoadingStudents(true);
        const data = await usersService.getStudents(undefined, selectedClassroom);
        setStudents(data || []);
      } catch (err) {
        console.error('Error loading students:', err);
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    };
    loadStudents();
  }, [selectedClassroom]);

  const selectClassroom = useCallback((classroomId: number | null) => {
    setSelectedClassroom(classroomId);
    setError(null);
  }, []);

  const createIncident = useCallback(async (data: CreateIncidentData): Promise<Incident | null> => {
    try {
      setIsSubmitting(true);
      setError(null);
      const incident = await incidentsService.create(data);
      onSuccess?.();
      return incident;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar incidencia');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess]);

  const updateIncident = useCallback(async (id: number, data: UpdateIncidentData): Promise<Incident | null> => {
    try {
      setIsSubmitting(true);
      setError(null);
      const incident = await incidentsService.update(id, data);
      onSuccess?.();
      return incident;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar incidencia');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [onSuccess]);

  const resetForm = useCallback(() => {
    setSelectedClassroom(null);
    setStudents([]);
    setError(null);
  }, []);

  return {
    // State
    classrooms,
    students,
    selectedClassroom,
    isLoadingClassrooms,
    isLoadingStudents,
    isSubmitting,
    error,
    // Actions
    selectClassroom,
    createIncident,
    updateIncident,
    resetForm,
  };
}
