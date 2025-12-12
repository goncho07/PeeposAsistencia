import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Phone, Calendar, Users, BookOpen, Briefcase, User as UserIcon } from 'lucide-react';
import { UserProfile, isStudent, isTeacher, isParent } from '@/types/userTypes';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const UserDetailModal: React.FC<{ user: UserProfile | null; onClose: () => void }> = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'academic'>('personal');

  if (!user) return null;

  const renderPersonalInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <p className="text-xs text-gray-400 uppercase font-bold mb-1">DNI / Documento</p>
        <p className="text-gray-800 dark:text-gray-200 font-medium">{user.dni}</p>
      </div>

      {user.email && user.email !== '-' && (
        <div>
          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Email</p>
          <p className="text-gray-800 dark:text-gray-200 font-medium flex items-center gap-1">
            <Mail size={14} className="text-gray-400" /> {user.email}
          </p>
        </div>
      )}

      {user.phone && (
        <div>
          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Teléfono</p>
          <p className="text-gray-800 dark:text-gray-200 font-medium flex items-center gap-1">
            <Phone size={14} className="text-gray-400" /> {user.phone}
          </p>
        </div>
      )}

      {isStudent(user) && (
        <>
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Código de Estudiante</p>
            <p className="text-gray-800 dark:text-gray-200 font-medium">{user.studentCode}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Fecha de Nacimiento</p>
            <p className="text-gray-800 dark:text-gray-200 font-medium flex items-center gap-1">
              <Calendar size={14} className="text-gray-400" />
              {new Date(user.dateOfBirth).toLocaleDateString('es-PE')}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Género</p>
            <p className="text-gray-800 dark:text-gray-200 font-medium capitalize">{user.gender}</p>
          </div>
        </>
      )}

      {isTeacher(user) && (
        <div>
          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Área</p>
          <p className="text-gray-800 dark:text-gray-200 font-medium">{user.area}</p>
        </div>
      )}

      {isParent(user) && (
        <div>
          <p className="text-xs text-gray-400 uppercase font-bold mb-1">Relación</p>
          <p className="text-gray-800 dark:text-gray-200 font-medium capitalize">{user.relationshipType}</p>
        </div>
      )}

      <div className="md:col-span-2 pt-4 border-t border-gray-100 dark:border-slate-800">
        <p className="text-xs text-gray-400 uppercase font-bold mb-2">Estado</p>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${user.status === 'ACTIVO'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
          {user.status}
        </span>
      </div>
    </div>
  );

  const renderAcademicInfo = () => {
    if (isStudent(user)) {
      return (
        <div className="space-y-6">
          {user.aulaInfo ? (
            <>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border-2 border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="text-blue-600 dark:text-blue-400" size={20} />
                  <h4 className="font-bold text-blue-900 dark:text-blue-100">Información de Aula</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold mb-1">Nivel</p>
                    <p className="text-blue-900 dark:text-blue-100 font-medium">{user.aulaInfo.level}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold mb-1">Grado</p>
                    <p className="text-blue-900 dark:text-blue-100 font-medium">
                      {user.aulaInfo.level.toUpperCase() === 'INICIAL'
                        ? `${user.aulaInfo.grade} Años - ${user.aulaInfo.section}`
                        : `${user.aulaInfo.grade}° ${user.aulaInfo.section}`}
                    </p>
                  </div>
                  {user.aulaInfo.docente && (
                    <div className="col-span-2">
                      <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold mb-1">Docente Tutor</p>
                      <p className="text-blue-900 dark:text-blue-100 font-medium">{user.aulaInfo.docente.fullName}</p>
                    </div>
                  )}
                </div>
              </div>

              {user.padreInfo && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border-2 border-orange-100 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="text-orange-600 dark:text-orange-400" size={20} />
                    <h4 className="font-bold text-orange-900 dark:text-orange-100">Apoderado</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-orange-600 dark:text-orange-400 uppercase font-bold mb-1">Nombre</p>
                      <p className="text-orange-900 dark:text-orange-100 font-medium">{user.padreInfo.fullName}</p>
                    </div>
                    {user.padreInfo.phoneNumber && (
                      <div>
                        <p className="text-xs text-orange-600 dark:text-orange-400 uppercase font-bold mb-1">Teléfono</p>
                        <p className="text-orange-900 dark:text-orange-100 font-medium flex items-center gap-1">
                          <Phone size={14} /> {user.padreInfo.phoneNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-2 opacity-30" />
              <p>No hay información de aula registrada</p>
            </div>
          )}
        </div>
      );
    }

    if (isTeacher(user)) {
      return (
        <div className="space-y-4">
          {user.aulasTutorizadas.length > 0 ? (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border-2 border-purple-100 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="text-purple-600 dark:text-purple-400" size={20} />
                <h4 className="font-bold text-purple-900 dark:text-purple-100">Aulas que Tutoriza</h4>
              </div>
              <div className="space-y-2">
                {user.aulasTutorizadas.map((aula) => (
                  <div
                    key={aula.id}
                    className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-purple-200 dark:border-purple-700"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{aula.fullName}</p>
                        <p className="text-xs text-gray-500">Código: {aula.code}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Briefcase size={48} className="mx-auto mb-2 opacity-30" />
              <p>No tutoriza aulas actualmente</p>
            </div>
          )}
        </div>
      );
    }

    if (isParent(user)) {
      return (
        <div className="space-y-4">
          {user.children.length > 0 ? (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border-2 border-orange-100 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="text-orange-600 dark:text-orange-400" size={20} />
                <h4 className="font-bold text-orange-900 dark:text-orange-100">Hijos Registrados</h4>
              </div>
              <div className="space-y-2">
                {user.children.map((hijo) => (
                  <div
                    key={hijo.id}
                    className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-orange-200 dark:border-orange-700"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{hijo.fullName}</p>
                        <p className="text-xs text-gray-500">Código: {hijo.studentCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{hijo.aula}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <UserIcon size={48} className="mx-auto mb-2 opacity-30" />
              <p>No tiene hijos registrados</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="text-center py-8 text-gray-400">
        <p>No hay información institucional adicional</p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gray-50 dark:bg-slate-800 p-8 pb-20 border-b border-gray-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white dark:bg-slate-700 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white shadow-sm transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex flex-col items-center">
            <div className={`w-28 h-28 rounded-full ${user.avatarGradient} flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-lg border-4 border-white dark:border-slate-900`}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <>
                  {user.fullName.charAt(0)}{user.fullName.split(' ')[1]?.charAt(0) || ''}
                </>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">{user.fullName}</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{user.headerLabel} • {user.type}</p>
          </div>
        </div>

        <div className="flex border-b border-gray-100 dark:border-slate-700 px-8 -mt-12 relative z-10 bg-white dark:bg-slate-900 rounded-t-3xl">
          {[
            { id: 'personal', label: 'Información Personal' },
            { id: 'academic', label: isStudent(user) ? 'Académico' : 'Institucional' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8 h-[350px] overflow-y-auto">
          {activeTab === 'personal' && renderPersonalInfo()}
          {activeTab === 'academic' && renderAcademicInfo()}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserDetailModal;