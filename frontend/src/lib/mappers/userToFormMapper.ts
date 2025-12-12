import { UserProfile } from '@/types/userTypes';
import { UserType } from '@/config/userFormConfig';
import { isAdmin, isStudent, isTeacher, isParent } from '@/types/userTypes';

export const mapUserToFormData = (user: UserProfile) => {
    let type: UserType = 'student';
    const baseData: Record<string, any> = {
        id: user.id,
        name: user.rawData?.name || '',
        paternal_surname: user.rawData?.paternal_surname || '',
        maternal_surname: user.rawData?.maternal_surname || '',
    };

    if (isAdmin(user)) {
        type = 'admin';
        return {
            userType: type,
            initialData: {
                ...baseData,
                dni: user.dni,
                rol: user.rol,
                email: user.email,
                phone_number: user.phone || '',
                password: '',
            },
        };
    }

    if (isStudent(user)) {
        type = 'student';
        return {
            userType: type,
            initialData: {
                ...baseData,
                document_type: user.rawData?.document_type || 'DNI',
                document_number: user.rawData?.document_number || user.dni,
                student_code: user.studentCode,
                gender: user.gender,
                date_of_birth: user.dateOfBirth,
                aula_id: user.aulaInfo?.id || '',
                padre_id: user.padreInfo?.id || '',
            },
        };
    }

    if (isTeacher(user)) {
        type = 'teacher';
        return {
            userType: type,
            initialData: {
                ...baseData,
                dni: user.dni,
                area: user.area,
                level: user.level,
                email: user.email,
                phone_number: user.phone || '',
            },
        };
    }

    if (isParent(user)) {
        type = 'parent';
        return {
            userType: type,
            initialData: {
                ...baseData,
                document_type: user.rawData?.document_type || 'DNI',
                document_number: user.rawData?.document_number || user.dni,
                relationship_type: user.relationshipType,
                email: user.email,
                phone_number: user.phone || '',
            },
        };
    }

    return { userType: type, initialData: baseData };
};
