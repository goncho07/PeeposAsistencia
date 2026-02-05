<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;

trait SyncsPivotRelations
{
    /**
     * Sync parents with a student.
     *
     * @param Model $student The student model
     * @param array $parentsData Array of parent data with keys: parent_id, relationship_type, etc.
     */
    protected function syncParentsRelation(Model $student, array $parentsData): void
    {
        $syncData = $this->buildPivotSyncData($parentsData, 'parent_id', $student->tenant_id);
        $student->parents()->sync($syncData);
    }

    /**
     * Sync students with a parent.
     *
     * @param Model $parent The parent model
     * @param array $studentsData Array of student data with keys: student_id, relationship_type, etc.
     */
    protected function syncStudentsRelation(Model $parent, array $studentsData): void
    {
        $syncData = $this->buildPivotSyncData($studentsData, 'student_id', $parent->tenant_id);
        $parent->students()->sync($syncData);
    }

    /**
     * Build the sync data array for pivot relations.
     *
     * @param array $relationsData The input array with relation data
     * @param string $foreignKey The foreign key name (parent_id or student_id)
     * @param int $tenantId The tenant ID to include in pivot
     */
    private function buildPivotSyncData(array $relationsData, string $foreignKey, int $tenantId): array
    {
        $syncData = [];

        foreach ($relationsData as $data) {
            $syncData[$data[$foreignKey]] = [
                'tenant_id' => $tenantId,
                'relationship_type' => $data['relationship_type'],
                'custom_relationship_label' => $data['custom_relationship_label'] ?? null,
                'is_primary_contact' => $data['is_primary_contact'] ?? false,
                'receives_notifications' => $data['receives_notifications'] ?? true,
            ];
        }

        return $syncData;
    }
}
