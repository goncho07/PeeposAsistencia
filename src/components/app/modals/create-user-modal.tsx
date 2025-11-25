"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EDUCATIONAL_STRUCTURE } from "@/lib/constants";
import type { EducationalLevel } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { User, X } from "lucide-react";
import React, { useState } from "react";

export function CreateUserModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    dni: "",
    type: "Estudiante",
    level: "",
    grade: "",
    section: "",
  });

  const handleValueChange =
    (field: keyof typeof formData) => (value: string) => {
      const newFormData = { ...formData, [field]: value };
      if (field === "type") {
        newFormData.level = "";
        newFormData.grade = "";
        newFormData.section = "";
      }
      if (field === "level") {
        newFormData.grade = "";
        newFormData.section = "";
      }
      if (field === "grade") {
        newFormData.section = "";
      }
      setFormData(newFormData);
    };

  const getGrades = () => {
    if (!formData.level) return [];
    return (
      EDUCATIONAL_STRUCTURE[formData.level as EducationalLevel]?.grades || []
    );
  };

  const getSections = () => {
    if (!formData.level) return [];
    return (
      EDUCATIONALSTRUCTURE[formData.level as EducationalLevel]?.sections || []
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-primary text-primary-foreground">
          <DialogTitle className="flex items-center gap-2">
            <User size={24} /> Nuevo Usuario
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de Usuario</Label>
              <Select
                value={formData.type}
                onValueChange={handleValueChange("type")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Estudiante">Estudiante</SelectItem>
                  <SelectItem value="Docente">Docente</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                  <SelectItem value="Apoderado">Apoderado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="12345678"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Apellidos y Nombres"
            />
          </div>

          {formData.type === "Estudiante" && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wide">
                Información Académica
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Nivel</Label>
                  <Select value={formData.level} onValueChange={handleValueChange("level")}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(EDUCATIONAL_STRUCTURE).map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Grado</Label>
                  <Select value={formData.grade} onValueChange={handleValueChange("grade")} disabled={!formData.level}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {getGrades().map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Sección</Label>
                  <Select value={formData.section} onValueChange={handleValueChange("section")} disabled={!formData.grade}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {getSections().map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-muted/50">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { alert("Usuario guardado"); onClose(); }}>Guardar Usuario</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
