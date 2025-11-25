"use client";

import { HeroHeader } from "@/components/app/hero-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Student } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Filter,
  LogOut,
  Search,
  Send,
  UserCheck,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const StudentDetailModal = ({ student, onClose }: { student: Student | null; onClose: () => void }) => {
  return (
    <Sheet open={!!student} onOpenChange={onClose}>
      <SheetContent className="p-8">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Detalle del Estudiante</SheetTitle>
        </SheetHeader>
        {student && (
          <div className="py-8">
            <div className="flex flex-col items-center mb-8">
              <div
                className={`w-24 h-24 rounded-full ${student.avatarColor} flex items-center justify-center text-3xl font-bold mb-4 shadow-inner`}
              >
                {student.name.charAt(0)}
                {student.name.split(" ")[1]?.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-foreground text-center">
                {student.name}
              </h3>
              <p className="text-muted-foreground">{student.grade}</p>
              <div
                className={`mt-3 px-4 py-1 rounded-full text-sm font-bold border ${
                  student.status === "Presente"
                    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                    : student.status === "Tardanza"
                    ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
                    : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                }`}
              >
                {student.status}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-muted/50 rounded-xl p-4 border grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Hora Entrada</p>
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Clock size={16} className="text-blue-500" /> {student.timeIn}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Hora Salida</p>
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <LogOut size={16} className="text-orange-500" /> {student.timeOut}
                  </div>
                </div>
              </div>
              <Button className="w-full py-4 font-bold" size="lg">
                <Send size={18} /> Enviar Notificación
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const itemsPerPage = 8;

  const allStudents: Student[] = useMemo(() => [
    { id: 1, name: "Matías Flores", grade: "5to Grado A", dni: "78901234", timeIn: "07:45 AM", timeOut: "15:00 PM", status: "Presente", avatarColor: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300" },
    { id: 2, name: "Sofía Vargas", grade: "4to Grado B", dni: "78901235", timeIn: "08:15 AM", timeOut: "--:--", status: "Tardanza", avatarColor: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300" },
    { id: 3, name: "Liam Torres", grade: "6to Grado A", dni: "78901236", timeIn: "--:--", timeOut: "--:--", status: "Ausente", avatarColor: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300" },
    { id: 4, name: "Valentina Ruiz", grade: "5to Grado A", dni: "78901237", timeIn: "07:50 AM", timeOut: "15:02 PM", status: "Presente", avatarColor: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300" },
    { id: 5, name: "Thiago Castro", grade: "3er Grado C", dni: "78901238", timeIn: "07:55 AM", timeOut: "14:58 PM", status: "Presente", avatarColor: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300" },
    { id: 6, name: "Emilia Gomez", grade: "2do Grado A", dni: "78901239", timeIn: "08:20 AM", timeOut: "--:--", status: "Tardanza", avatarColor: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-300" },
    { id: 7, name: "Benjamín Núñez", grade: "1er Grado B", dni: "78901240", timeIn: "--:--", timeOut: "--:--", status: "Ausente", avatarColor: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300" },
    { id: 8, name: "Julieta Díaz", grade: "4to Grado C", dni: "78901241", timeIn: "07:48 AM", timeOut: "15:05 PM", status: "Presente", avatarColor: "bg-lime-100 text-lime-600 dark:bg-lime-900/40 dark:text-lime-300" },
  ], []);

  const filteredStudents = useMemo(() => {
    return allStudents.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || student.dni.includes(searchQuery);
      const matchesFilter = filterStatus === "Todos" || student.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterStatus, allStudents]);

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice( (currentPage - 1) * itemsPerPage, currentPage * itemsPerPage );

  return (
    <div className="w-full flex justify-center bg-background min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1280px] px-8 py-6 flex flex-col">
        <HeroHeader
          title="Gestión de Asistencia"
          subtitle="Control y validación de registros de entrada y salida"
          icon={ClipboardCheck}
          gradient="bg-gradient-to-tr from-indigo-500 to-purple-600"
          decorativeIcon={UserCheck}
        />
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="relative w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input type="text" placeholder="Buscar estudiante por nombre o DNI..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-12 pr-4 h-12 bg-card border rounded-lg text-base focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary/50" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 px-5 text-base">
                <Filter size={20} className="text-muted-foreground mr-2" />
                {filterStatus === "Todos" ? "Filtros" : filterStatus}
                <ChevronDown size={20} className="text-muted-foreground ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {["Todos", "Presente", "Tardanza", "Ausente"].map((status) => (
                <DropdownMenuItem key={status} onSelect={() => setFilterStatus(status)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-semibold text-foreground">Registro de Hoy</span>
            <span className="text-base text-muted-foreground">{new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="bg-primary/10 px-4 py-2 rounded-lg text-primary font-medium text-sm">
            {filteredStudents.length} registros
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[35%]">Estudiante</TableHead>
                <TableHead className="w-[15%]">Grado</TableHead>
                <TableHead className="w-[15%] flex items-center gap-2"><Clock size={14} /> Entrada</TableHead>
                <TableHead className="w-[15%]"><Clock size={14} /> Salida</TableHead>
                <TableHead className="w-[20%] text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <motion.tr key={student.id} variants={itemVariants} initial="hidden" animate="show" exit={{ opacity: 0 }} onClick={() => setSelectedStudent(student)} className="cursor-pointer group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${student.avatarColor} flex items-center justify-center text-sm font-bold`}>
                          {student.name.charAt(0)}{student.name.split(" ")[1]?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-base font-medium text-foreground group-hover:text-primary transition-colors">{student.name}</p>
                          <p className="text-xs text-muted-foreground">DNI: {student.dni}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-base text-muted-foreground">{student.grade}</TableCell>
                    <TableCell className={`text-base ${ student.status === "Tardanza" ? "text-orange-600 dark:text-orange-400 font-medium" : "text-foreground" }`}>
                      {student.timeIn}
                    </TableCell>
                    <TableCell className="text-base text-muted-foreground">{student.timeOut}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${ student.status === "Presente" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : student.status === "Tardanza" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }`}>
                        {student.status}
                      </span>
                    </TableCell>
                  </motion.tr>
                ))
              ) : (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">No se encontraron estudiantes.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /> Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Siguiente <ChevronRight className="h-4 w-4" /></Button>
            </div>
        )}
        <AnimatePresence>{selectedStudent && <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}</AnimatePresence>
      </motion.div>
    </div>
  );
}
