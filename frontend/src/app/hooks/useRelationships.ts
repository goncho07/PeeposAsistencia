import { useState, useMemo, useCallback } from 'react';

export interface Relationship {
  id?: number;
  parent_id?: number;
  student_id?: number;
  relationship_type: string;
  custom_relationship_label?: string;
  is_primary_contact: boolean;
  receives_notifications: boolean;
}

interface UseRelationshipsOptions {
  initialRelations?: Relationship[];
  maxCount?: number;
  relationType: 'parent' | 'student';
}

interface UseRelationshipsReturn {
  relations: Relationship[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addRelation: () => void;
  removeRelation: (index: number) => void;
  updateRelation: (index: number, field: keyof Relationship, value: any) => void;
  canAddMore: boolean;
  getRelationsForSubmit: () => any[];
}

export function useRelationships({
  initialRelations = [],
  maxCount = 5,
  relationType,
}: UseRelationshipsOptions): UseRelationshipsReturn {
  const [relations, setRelations] = useState<Relationship[]>(() => {
    if (initialRelations.length > 0) {
      return initialRelations.map(rel => ({
        ...rel,
        [relationType === 'parent' ? 'parent_id' : 'student_id']:
          relationType === 'parent' ? rel.parent_id || rel.id : rel.student_id || rel.id,
      }));
    }
    return [];
  });

  const [searchQuery, setSearchQuery] = useState('');

  const addRelation = useCallback(() => {
    if (relations.length >= maxCount) return;

    const newRelation: Relationship = {
      [relationType === 'parent' ? 'parent_id' : 'student_id']: 0,
      relationship_type: '',
      custom_relationship_label: '',
      is_primary_contact: relations.length === 0,
      receives_notifications: true,
    };

    setRelations(prev => [...prev, newRelation]);
  }, [relations.length, maxCount, relationType]);

  const removeRelation = useCallback((index: number) => {
    setRelations(prev => {
      const newRelations = prev.filter((_, i) => i !== index);

      if (prev[index].is_primary_contact && newRelations.length > 0) {
        newRelations[0].is_primary_contact = true;
      }

      return newRelations;
    });
  }, []);

  const updateRelation = useCallback((index: number, field: keyof Relationship, value: any) => {
    setRelations(prev => {
      const newRelations = [...prev];

      if (field === 'is_primary_contact' && value === true) {
        newRelations.forEach((rel, i) => {
          if (i !== index) {
            rel.is_primary_contact = false;
          }
        });
      }

      newRelations[index] = {
        ...newRelations[index],
        [field]: value,
      };

      return newRelations;
    });
  }, []);

  const canAddMore = useMemo(() => relations.length < maxCount, [relations.length, maxCount]);

  const getRelationsForSubmit = useCallback(() => {
    return relations
      .filter(rel => {
        const id = relationType === 'parent' ? rel.parent_id : rel.student_id;
        return id && id > 0 && rel.relationship_type;
      })
      .map(rel => ({
        [relationType === 'parent' ? 'parent_id' : 'student_id']:
          relationType === 'parent' ? rel.parent_id : rel.student_id,
        relationship_type: rel.relationship_type,
        custom_relationship_label: rel.relationship_type === 'OTRO' ? rel.custom_relationship_label : null,
        is_primary_contact: rel.is_primary_contact,
        receives_notifications: rel.receives_notifications,
      }));
  }, [relations, relationType]);

  return {
    relations,
    searchQuery,
    setSearchQuery,
    addRelation,
    removeRelation,
    updateRelation,
    canAddMore,
    getRelationsForSubmit,
  };
}
