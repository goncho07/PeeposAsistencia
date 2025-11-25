"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  GraduationCap,
  Grid3x3,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { CreateUserModal } from "@/components/app/modals/create-user-modal";
import { UserDetailModal } from "@/components/app/modals/user-detail-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserProfile } from "@/lib/types";
import {
  SECTIONS_INICIAL,
  SECTIONS_PRIMARIA,
  SECTIONS_SECUNDARIA,
} from "@/lib/constants";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

// Role Filter Card Component
const RoleFilterCard = ({
  type,
  label,
  icon: Icon,
  colorClass,
  activeColorClass,
  count,
  onClick,
  isActive,
}: {
  type: string;
  label: string;
  icon: any;
  colorClass: string;
  activeColorClass: string;
  count: number;
  onClick: () => void;
  isActive: boolean;
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative flex flex-col items-start justify-between p-5 rounded-2xl border transition-all duration-300 h-28 w-full shadow-sm overflow-hidden group ${
        isActive
          ? `${activeColorClass} border-transparent text-white shadow-md`
          : "bg-card border-border hover:border-gray-300 dark:hover:border-slate-700 text-muted-foreground"
      }`}
    >
      <div className="flex justify-between w-full z-10">
        <div
          className={`p-2 rounded-xl ${
            isActive
              ? "bg-white/20"
              : colorClass.replace("text-", "bg-").replace("600", "50").replace("500", "50") +
                " " +
                colorClass
          } dark:bg-opacity-20`}
        >
          <Icon size={20} className={isActive ? "text-white" : ""} />
        </div>
        <span className={`text-2xl font-bold ${isActive ? "text-white" : "text-foreground"}`}>
          {count}
        </span>
      </div>
      <span
        className={`font-semibold text-sm z-10 mt-2 ${
          isActive
            ? "text-white/90"
            : "text-muted-foreground group-hover:text-foreground"
        }`}
      >
        {label}
      </span>
      <Icon
        className={`absolute -right-4 -bottom-4 opacity-10 transform -rotate-12 transition-transform group-hover:scale-110 ${
          isActive ? "text-white" : colorClass
        }`}
        size={80}
        strokeWidth={1.5}
      />
    </motion.button>
  );
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedUserType, setSelectedUserType] = useState<string>("Estudiante");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const itemsPerPage = viewMode === 'grid' ? 9 : 10;

  const mockUsers: UserProfile[] = useMemo(() => {
    const users: UserProfile[] = [];
    const names = [ 'Matías Flores', 'Sofía Vargas', 'Liam Torres', 'Valentina Ruiz', 'Thiago Castro', 'Camila Rojas', 'Mateo Cruz', 'Luciana Pavez', 'Gabriel Soto', 'Isabella Mendoza' ];
    for (let i = 0; i < 80; i++) {
      let type: UserProfile["type"];
      if (i < 40) type = "Estudiante";
      else if (i < 55) type = "Docente";
      else if (i < 65) type = "Administrativo";
      else type = "Apoderado";

      const name = `${names[i % names.length]} ${String.fromCharCode(65 + (i % 26))}.`;
      const level = i % 3 === 0 ? "Inicial" : i % 3 === 1 ? "Primaria" : "Secundaria";

      let academicLocation = "-";
      let gradeText = "-";
      let avatarGradient = "bg-gray-500";
      let section = "-";

      if (type === "Estudiante") {
        if (level === "Inicial") { gradeText = "5 Años"; section = SECTIONS_INICIAL[i % SECTIONS_INICIAL.length]; avatarGradient = "bg-gradient-to-br from-pink-400 to-rose-500"; } 
        else if (level === "Primaria") { gradeText = "5to Grado"; section = SECTIONS_PRIMARIA[i % SECTIONS_PRIMARIA.length]; avatarGradient = "bg-gradient-to-br from-blue-400 to-indigo-500"; } 
        else { gradeText = "3ro Año"; section = SECTIONS_SECUNDARIA[i % SECTIONS_SECUNDARIA.length]; avatarGradient = "bg-gradient-to-br from-emerald-400 to-teal-500"; }
        academicLocation = level;
      } else if (type === "Docente") { gradeText = "Docente"; avatarGradient = "bg-gradient-to-br from-violet-500 to-purple-600"; } 
      else if (type === "Administrativo") { gradeText = "Admin"; avatarGradient = "bg-gradient-to-br from-slate-500 to-slate-700"; } 
      else { gradeText = "Apoderado"; avatarGradient = "bg-gradient-to-br from-amber-400 to-orange-500"; }

      users.push({ id: i + 1, type, name, dni: `7${Math.floor(Math.random() * 10000000)}`, avatarGradient, roleOrGrade: type === "Estudiante" ? gradeText : type === "Apoderado" ? "Padre de Familia" : gradeText, email: `user${i}@peepos.edu.pe`, phone: `9${Math.floor(Math.random() * 100000000)}`, status: Math.random() > 0.1 ? "Activo" : "Inactivo", level: type === "Estudiante" ? level : undefined, academicLocation, section: section, grade: gradeText });
    }
    return users;
  }, []);

  const counts = useMemo(
    () => ({
      Estudiante: mockUsers.filter((u) => u.type === "Estudiante").length,
      Docente: mockUsers.filter((u) => u.type === "Docente").length,
      Administrativo: mockUsers.filter((u) => u.type === "Administrativo").length,
      Apoderado: mockUsers.filter((u) => u.type === "Apoderado").length,
    }),
    [mockUsers]
  );

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.dni.includes(searchQuery);
      return matchesSearch && user.type === selectedUserType;
    });
  }, [searchQuery, selectedUserType, mockUsers]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice( (currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const roleFilters = [
    { type: "Estudiante", label: "Estudiantes", icon: GraduationCap, color: "text-blue-600", activeColor: "bg-blue-600" },
    { type: "Docente", label: "Docentes", icon: Briefcase, color: "text-purple-600", activeColor: "bg-purple-600" },
    { type: "Administrativo", label: "Administrativos", icon: Shield, color: "text-slate-600", activeColor: "bg-slate-600" },
    { type: "Apoderado", label: "Apoderados", icon: User, color: "text-orange-500", activeColor: "bg-orange-500" },
  ];

  return (
    <div className="w-full flex justify-center bg-background min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1400px] px-8 py-6 flex flex-col">
        <div className="bg-gradient-to-r from-primary to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-2xl p-6 text-white shadow-lg mb-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Users size={28} className="text-white/90" />
              <h1 className="text-2xl font-bold tracking-tight">Directorio de Usuarios</h1>
            </div>
            <p className="text-blue-100 text-sm font-medium pl-10">Gestión centralizada de comunidad educativa</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20 shadow-inner flex flex-col items-end">
            <p className="text-xs text-blue-100 uppercase font-bold tracking-wider mb-0.5">Total Usuarios</p>
            <p className="text-3xl font-bold leading-none">{mockUsers.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {roleFilters.map((filter) => (
            <RoleFilterCard
              key={filter.type}
              type={filter.type}
              label={filter.label}
              icon={filter.icon}
              colorClass={filter.color}
              activeColorClass={filter.activeColor}
              count={counts[filter.type as keyof typeof counts] || 0}
              onClick={() => { setSelectedUserType(filter.type); setCurrentPage(1); }}
              isActive={selectedUserType === filter.type}
            />
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder={`Buscar ${selectedUserType.toLowerCase()} por nombre o DNI...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 h-12 bg-card border shadow-sm"
            />
            {searchQuery && ( <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"> <XCircle size={16} /> </button> )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-card border rounded-lg p-1 shadow-sm">
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")} className="h-9 w-9"><Grid3x3 size={20} /></Button>
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")} className="h-9 w-9"><List size={20} /></Button>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="font-bold shadow-md shadow-primary/20 dark:shadow-none h-12"> <Plus size={20} /> Nuevo Usuario </Button>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border flex-1 flex flex-col min-h-[400px]">
          {filteredUsers.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {paginatedUsers.map((user) => (
                      <motion.div key={user.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={() => setSelectedUser(user)} className="bg-card border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden" >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex flex-col items-center gap-3 mb-4">
                          <div className={`w-20 h-20 rounded-full ${user.avatarGradient} flex items-center justify-center text-2xl font-bold text-white shadow-md border-4 border-background group-hover:scale-105 transition-transform`}> {user.name.charAt(0)}{user.name.split(" ")[1]?.charAt(0)} </div>
                          <div className="text-center">
                            <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">{user.name}</h3>
                            <p className="text-xs text-muted-foreground font-medium mt-1">DNI: {user.dni}</p>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-foreground bg-muted/50 p-2 rounded-lg justify-center">
                            {user.type === "Estudiante" ? <GraduationCap size={16} className="text-muted-foreground" /> : <Briefcase size={16} className="text-muted-foreground" />}
                            <span className="truncate font-medium">{user.roleOrGrade}</span>
                          </div>
                        </div>
                        <div className="flex justify-center border-t pt-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === "Activo" ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"}`}> {user.status} </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                      <tr>
                        <th className="px-6 py-4">Usuario</th><th className="px-6 py-4">Rol</th><th className="px-6 py-4">Área</th><th className="px-6 py-4">Sección</th><th className="px-6 py-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedUser(user)}>
                              <div className={`w-9 h-9 rounded-full ${user.avatarGradient} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>{user.name.charAt(0)}</div>
                              <div>
                                <p className="font-bold text-foreground group-hover:text-primary transition-colors text-base">{user.name}</p>
                                <p className="text-xs text-muted-foreground font-medium">DNI: {user.dni}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {user.type === "Estudiante" && <GraduationCap size={16} className="text-blue-500" />}
                              {user.type === "Docente" && <Briefcase size={16} className="text-purple-500" />}
                              {user.type === "Administrativo" && <Shield size={16} className="text-slate-500" />}
                              {user.type === "Apoderado" && <User size={16} className="text-orange-500" />}
                              <span className="text-foreground font-medium">{user.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {user.academicLocation !== "-" ? ( <span className="inline-flex items-center px-2.5 py-1 bg-muted rounded-md text-xs text-muted-foreground font-medium"> {user.academicLocation} </span> ) : ( <span className="text-muted-foreground">-</span> )}
                          </td>
                          <td className="px-6 py-4 text-foreground/80 font-medium"> {user.section !== "-" ? user.section : <span className="text-muted-foreground">-</span>} </td>
                          <td className="px-6 py-4 text-right">
                            <div className="relative group/menu inline-block">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><MoreHorizontal size={20} /></Button>
                              <div className="absolute right-0 top-8 w-40 bg-popover border rounded-xl shadow-xl hidden group-hover/menu:block z-10 p-1">
                                <Button variant="ghost" onClick={() => setSelectedUser(user)} className="w-full justify-start text-sm gap-2"><Eye size={14} /> Ver Detalle</Button>
                                <Button variant="ghost" className="w-full justify-start text-sm gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700"><Edit size={14} /> Editar</Button>
                                <div className="h-px bg-border my-1"></div>
                                <Button variant="ghost" className="w-full justify-start text-sm gap-2 text-red-600 dark:text-red-400 hover:text-red-700"><Trash2 size={14} /> Eliminar</Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {totalPages > 1 && (
                <div className="border-t p-4 flex justify-between items-center bg-muted/30 mt-auto">
                  <span className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={18} /></Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight size={18} /></Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="p-4 bg-muted rounded-full mb-4"> <Search size={32} className="opacity-50" /> </div>
              <h3 className="text-lg font-semibold text-foreground/80">No se encontraron usuarios</h3>
              <p className="text-sm">Intenta con otros términos de búsqueda o filtros.</p>
            </div>
          )}
        </div>

        <AnimatePresence>{selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}</AnimatePresence>
        <AnimatePresence>{isCreateModalOpen && <CreateUserModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />}</AnimatePresence>
      </motion.div>
    </div>
  );
}
