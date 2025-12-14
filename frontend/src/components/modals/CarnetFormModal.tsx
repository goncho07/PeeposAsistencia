import React from 'react';
import { DynamicFormModal } from '@/components/modals/DynamicFormModal';
import { CARNET_USER_TYPES, FIELD_CONFIGS, CarnetUserType } from '@/config/carnetFormConfig';
import { UserProfile } from '@/types/userTypes';

interface CarnetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { type: CarnetUserType; level?: string; grade?: number; section?: string }) => Promise<void>;
    users?: UserProfile[];
}

export const CarnetFormModal : React.FC<CarnetFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  users
}) => {
  const [userType, setUserType] = React.useState<CarnetUserType>('student');

  const fields = React.useMemo(() => {
    if (!userType) return [];
    return [...FIELD_CONFIGS[userType]];
  }, [userType]);

  return (
    <DynamicFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={async (data) => {
        const payload = { ...data, type: userType };
        await onSubmit(payload);
      }}
      config={{
        title: `Generar Carnets ${CARNET_USER_TYPES.find((u) => u.value === userType)?.label}`,
        submitLabel: 'Generar',
        color: 'purple',
        fields,
      }}
      contentTop={
        <div>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Usuario <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-3 gap-3">
            {CARNET_USER_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setUserType(type.value)}
                className={`p-3 rounded-lg border-2 font-semibold text-sm transition-all ${userType === type.value
                    ? 'border-purple-500 bg-blue-50 dark:bg-blue-900/20 text-purple-700 dark:text-purple-400'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-gray-400'
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      }
    />
  );
};
