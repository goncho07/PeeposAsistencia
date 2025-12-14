import { 
    UserProfile,
    AdminProfile,
    StudentProfile,
    TeacherProfile,
    ParentProfile,
    ApiUserResponse,
    AdminData,
    EstudianteData,
    DocenteData,
    PadreData
} from '@/types/userTypes';

const ROLE_MAP: Record<string, UserProfile['type']> = {
    'admin': 'Administrativo',
    'student': 'Estudiante',
    'teacher': 'Docente',
    'parent': 'Apoderado'
};

export const getAvatarGradient = (type: string, nivel?: string): string => {
    if (type === 'Estudiante' && nivel) {
        switch (nivel.toUpperCase()) {
            case 'INICIAL':
                return 'bg-gradient-to-br from-pink-400 to-rose-500';
            case 'PRIMARIA':
                return 'bg-gradient-to-br from-blue-400 to-indigo-500';
            case 'SECUNDARIA':
                return 'bg-gradient-to-br from-emerald-400 to-teal-500';
            default:
                return 'bg-gradient-to-br from-gray-400 to-gray-500';
        }
    }

    switch (type) {
        case 'Docente':
            return 'bg-gradient-to-br from-violet-500 to-purple-600';
        case 'Administrativo':
            return 'bg-gradient-to-br from-slate-500 to-slate-700';
        case 'Apoderado':
            return 'bg-gradient-to-br from-amber-400 to-orange-500';
        default:
            return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
};

export const mapUserData = (apiUser: ApiUserResponse): UserProfile => {
    const type = ROLE_MAP[apiUser.type];

    switch (apiUser.type) {
        case 'admin': {
            const data = apiUser.data as AdminData;
            const profile: AdminProfile = {
                type: 'Administrativo',
                id: data.id,
                fullName: data.full_name,
                dni: data.dni,
                email: data.email || '-',
                phone: data.phone_number || undefined,
                status: data.status === 'ACTIVO' ? 'ACTIVO' : 'INACTIVO',
                avatarGradient: getAvatarGradient('Administrativo'),
                headerLabel: data.rol || 'Admin',
                rol: data.rol,
                avatarUrl: data.avatar_url || undefined,
                rawData: data,
            };
            return profile;
        }

        case 'student': {
            const data = apiUser.data as EstudianteData;
            const profile: StudentProfile = {
                type: 'Estudiante',
                id: data.id,
                fullName: data.full_name,
                dni: data.document_number,
                email: '-',
                phone: undefined,
                status: 'ACTIVO',
                section: data.aula?.section || '-',
                level: data.aula?.level,
                grade: data.aula?.grade?.toString(),
                avatarGradient: getAvatarGradient('Estudiante', data.aula?.level),
                headerLabel: data.aula
                    ? data.aula.level.toUpperCase() === 'INICIAL'
                        ? `${data.aula.grade} AÑOS ${data.aula.section}`
                        : `${data.aula.grade}° ${data.aula.section}`
                    : '-',
                avatarUrl: undefined,
                studentCode: data.student_code,
                edad: data.age,
                qrCode: data.qr_code,
                aulaInfo: data.aula
                    ? {
                        id: data.aula.id,
                        code: data.aula.code,
                        fullName: data.aula.full_name,
                        level: data.aula.level,
                        grade: data.aula.grade,
                        section: data.aula.section,
                        docente: data.aula.docente
                            ? {
                                id: data.aula.docente.id,
                                fullName: data.aula.docente.full_name,
                            }
                            : undefined,
                        studentCount: data.aula.student_count,
                    }
                    : null,
                padreInfo: data.padre
                    ? {
                        id: data.padre.id,
                        fullName: data.padre.full_name,
                        phoneNumber: data.padre.phone_number,
                    }
                    : null,
                gender: data.gender,
                dateOfBirth: data.date_of_birth,
                rawData: data,
            };
            return profile;
        }

        case 'teacher': {
            const data = apiUser.data as DocenteData;
            const profile: TeacherProfile = {
                type: 'Docente',
                id: data.id,
                fullName: data.full_name,
                dni: data.dni,
                email: data.email || '-',
                phone: data.phone_number || undefined,
                status: 'ACTIVO',
                avatarGradient: getAvatarGradient('Docente'),
                headerLabel: data.area || 'Docente',
                avatarUrl: undefined,
                area: data.area,
                level: data.level,
                aulasTutorizadas: data.aulas_tutorizadas.map((aula) => ({
                    id: aula.id,
                    code: aula.code,
                    fullName: aula.full_name,
                })),
                rawData: data,
            };
            return profile;
        }

        case 'parent': {
            const data = apiUser.data as PadreData;
            const profile: ParentProfile = {
                type: 'Apoderado',
                id: data.id,
                fullName: data.full_name,
                dni: data.document_number,
                email: data.email || '-',
                phone: data.phone_number || undefined,
                status: 'ACTIVO',
                avatarGradient: getAvatarGradient('Apoderado'),
                headerLabel: data.relationship_type || 'Apoderado',
                avatarUrl: undefined,
                relationshipType: data.relationship_type,
                children: data.children?.map(child => ({
                    id: child.id,
                    fullName: child.full_name,
                    studentCode: child.student_code,
                    aula: child.aula?.full_name || '-',
                })) || [],
                rawData: data,
            };
            return profile;
        }

        default:
            throw new Error(`Tipo de usuario desconocido: ${apiUser.type}`);
    }
};