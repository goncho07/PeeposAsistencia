"use client";

import { HeroHeader } from "@/components/app/hero-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Building, Check, Globe, ImageIcon, Link as LinkIcon, MapPin, Phone, Settings, Sliders, Smartphone, Upload, User } from "lucide-react";
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
    const [schoolForm, setSchoolForm] = useState({ cellphone: '', name: '', address: '', director: '' });
    const [attendanceForm, setAttendanceForm] = useState({ days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], tardiness: 5, whatsapp: true, timezone: 'America/Lima' });
    const [visualForm, setVisualForm] = useState({ loginBg: 'https://picsum.photos/seed/loginbg/1920/1080', schoolLogo: 'https://picsum.photos/seed/schoollogo/400/400', sidebarLogo: 'https://picsum.photos/seed/sidebarlogo/100/100' });

    const toggleDay = (day: string) => { setAttendanceForm(prev => ({ ...prev, days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day] })); };

    return (
        <div className="w-full flex justify-center bg-background min-h-full">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[1080px] px-8 py-8 flex flex-col">
                <HeroHeader title="Configuración del Sistema" subtitle="Administración de datos escolares, horarios y preferencias globales" icon={Settings} gradient="bg-gradient-to-r from-slate-700 to-slate-900" decorativeIcon={Sliders} />
                
                <Tabs defaultValue="school" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                        <TabsTrigger value="school" className="py-2.5 text-sm uppercase">Escuela</TabsTrigger>
                        <TabsTrigger value="attendance" className="py-2.5 text-sm uppercase">Asistencia</TabsTrigger>
                        <TabsTrigger value="visual" className="py-2.5 text-sm uppercase">Personalización</TabsTrigger>
                    </TabsList>
                    
                    <div className="bg-card rounded-b-lg border border-t-0 p-8 shadow-sm">
                        <TabsContent value="school" className="space-y-8 mt-0">
                            <div>
                                <h3 className="text-lg font-bold text-foreground border-b pb-4 mb-6 uppercase">Escuela</h3>
                                <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6 mb-6">
                                    <div className="space-y-2">
                                        <Label>Código País:</Label>
                                        <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><Input type="text" disabled value="+51" className="w-full h-12 pl-10 pr-4 bg-muted text-muted-foreground font-medium" /></div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Celular:</Label>
                                        <div className="relative"><Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><Input type="text" placeholder="991 454 477" maxLength={9} value={schoolForm.cellphone} onChange={(e) => setSchoolForm({...schoolForm, cellphone: e.target.value.replace(/\D/g, '')})} className="w-full h-12 pl-10 pr-4" /></div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2"><Label>Nombre de la Escuela:</Label><div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><Input type="text" placeholder="I.E FRANCISCO BOLOGNESI" value={schoolForm.name} onChange={(e) => setSchoolForm({...schoolForm, name: e.target.value})} className="h-12 pl-10" /></div></div>
                                    <div className="space-y-2"><Label>Dirección:</Label><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><Input type="text" placeholder="AV. FRANCISCO BOLOGNESI S/N" value={schoolForm.address} onChange={(e) => setSchoolForm({...schoolForm, address: e.target.value})} className="h-12 pl-10" /></div></div>
                                    <div className="space-y-2"><Label>Director:</Label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><Input type="text" placeholder="BERNABE MEDINA ZELA" value={schoolForm.director} onChange={(e) => setSchoolForm({...schoolForm, director: e.target.value})} className="h-12 pl-10" /></div></div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-6 border-t"><Button className="w-40 h-12">Actualizar</Button></div>
                        </TabsContent>
                        
                        <TabsContent value="attendance" className="space-y-8 mt-0">
                            <div>
                                <h3 className="text-lg font-bold text-foreground border-b pb-4 mb-6 uppercase">ASISTENCIA Y ZONA HORARIA</h3>
                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <Label>Seleccione días de asistencia</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'].map((day, i) => { const dayCode = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]; return (<label key={day} className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border bg-background hover:bg-muted/80 transition-colors"><div onClick={() => toggleDay(dayCode)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${attendanceForm.days.includes(dayCode) ? 'bg-primary border-primary' : 'bg-card border-muted-foreground group-hover:border-primary'}`}>{attendanceForm.days.includes(dayCode) && <Check size={14} className="text-primary-foreground" strokeWidth={3} />}</div><span className="text-sm text-foreground">{day}</span></label>); })}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Minutos Tardanza:</Label>
                                        <Input type="number" min="0" max="60" step="5" value={attendanceForm.tardiness} onChange={(e) => setAttendanceForm({...attendanceForm, tardiness: parseInt(e.target.value)})} className="h-12 max-w-[200px]" />
                                        <p className="text-xs text-muted-foreground">Tiempo de tolerancia antes de marcar tardanza.</p>
                                    </div>
                                    <div className="p-5 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 flex items-center justify-between">
                                        <Label htmlFor="whatsapp-switch" className="font-medium text-foreground flex items-center gap-3"><MessageCircle className="text-green-600 dark:text-green-400" size={24} />Notificar whatsapp al pasar Asistencia</Label>
                                        <Switch id="whatsapp-switch" checked={attendanceForm.whatsapp} onCheckedChange={(checked) => setAttendanceForm(prev => ({...prev, whatsapp: checked}))} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Seleccione una Zona Horaria</Label>
                                        <Select value={attendanceForm.timezone} onValueChange={(value) => setAttendanceForm({...attendanceForm, timezone: value})}>
                                            <SelectTrigger className="h-12"><div className="flex items-center gap-3"><Globe className="text-muted-foreground" size={18} /><SelectValue /></div></SelectTrigger>
                                            <SelectContent><SelectItem value="America/Lima">(GMT-05:00) America/Lima</SelectItem><SelectItem value="America/Bogota">(GMT-05:00) America/Bogota</SelectItem><SelectItem value="America/New_York">(GMT-04:00) America/New_York</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-6 border-t"><Button className="w-40 h-12">Actualizar</Button></div>
                        </TabsContent>

                        <TabsContent value="visual" className="space-y-8 mt-0">
                            <div>
                                <h3 className="text-lg font-bold text-foreground border-b pb-4 mb-6 uppercase">PERSONALIZACIÓN VISUAL</h3>
                                <div className="space-y-6">
                                    <div className="space-y-2"><Label>Fondo del Login (URL)</Label><div className="relative"><ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><Input type="text" placeholder="https://example.com/image.jpg" value={visualForm.loginBg} onChange={(e) => setVisualForm({...visualForm, loginBg: e.target.value})} className="h-12 pl-10" /></div><p className="text-xs text-muted-foreground">URL de la imagen de fondo para la pantalla de inicio de sesión.</p></div>
                                    <div className="space-y-2"><Label>Logo del Colegio (Login) (URL)</Label><div className="relative"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><Input type="text" placeholder="https://example.com/logo.png" value={visualForm.schoolLogo} onChange={(e) => setVisualForm({...visualForm, schoolLogo: e.target.value})} className="h-12 pl-10" /></div><p className="text-xs text-muted-foreground">Logo principal que aparece en el formulario de login.</p></div>
                                    <div className="space-y-2"><Label>Logo del Sidebar (Sistema) (URL)</Label><div className="relative"><LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><Input type="text" placeholder="https://example.com/icon.png" value={visualForm.sidebarLogo} onChange={(e) => setVisualForm({...visualForm, sidebarLogo: e.target.value})} className="h-12 pl-10" /></div><p className="text-xs text-muted-foreground">Icono pequeño que aparece en la barra lateral del sistema.</p></div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-6 border-t"><Button className="w-40 h-12">Guardar Cambios</Button></div>
                        </TabsContent>
                    </div>
                </Tabs>
            </motion.div>
        </div>
    );
};
