'use client';
import React from 'react';
import { DynamicFormModal, DynamicFormConfig } from '@/components/modals/DynamicFormModal';
import { UserProfile } from '@/types/userTypes';

interface RReportFormModalProps {
    config: DynamicFormConfig;
    initialData?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => Promise<void>;
    users?: UserProfile[];
    contentTop?: React.ReactNode;
}

/**
 * Always-open wrapper around DynamicFormModal for use as inline content
 */
const ReportFormModal: React.FC<RReportFormModalProps> = ({
    config,
    initialData,
    onSubmit,
    users,
    contentTop
}) => {
    return (
        <div className="w-full">
            <DynamicFormModal
                isOpen={true}
                config={config}
                initialData={initialData}
                onClose={() => { }}
                onSubmit={onSubmit}
                users={users}
                contentTop={contentTop}
            />
        </div>
    );
};

export default ReportFormModal;
