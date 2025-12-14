import React from 'react';
import { DynamicFormModal } from '@/components/modals/DynamicFormModal';
import { FIELD_CONFIGS, COMMON_FIELDS, USER_TYPES, UserType} from '@/config/userFormConfig';
import { UserProfile } from '@/types/userTypes';

interface CreateUserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  users?: UserProfile[];
}

export const CreateUserFormModal: React.FC<CreateUserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  users
}) => {
  const [userType, setUserType] = React.useState<UserType>('student');

  const fields = React.useMemo(() => {
    if (!userType) return [];
    return [...COMMON_FIELDS, ...FIELD_CONFIGS[userType]];
  }, [userType]);

  return (
    <DynamicFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      config={{
        title: `Nuevo ${USER_TYPES.find((u) => u.value === userType)?.label}`,
        submitLabel: 'Guardar',
        color: 'blue',
        fields,
      }}
      users={users}
      contentTop={
        <div>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Usuario <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-4 gap-3">
            {USER_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setUserType(type.value)}
                className={`p-3 rounded-lg border-2 font-semibold text-sm transition-all ${userType === type.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
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
