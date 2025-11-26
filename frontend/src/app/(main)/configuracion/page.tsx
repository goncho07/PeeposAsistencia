'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Sliders, Phone, Smartphone, Building, MapPin, User, Upload, Check, Clock, MessageCircle, Globe, ChevronDown, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import HeroHeader from '@/components/ui/HeroHeader';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'school' | 'attendance' | 'visual'>('school');
  const [schoolForm, setSchoolForm] = useState({ cellphone: '', name: '', address: '', director: '' });
  const [attendanceForm, setAttendanceForm] = useState({ days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], tardiness: 5, whatsapp: true, timezone: 'America/Lima' });
  const [visualForm, setVisualForm] = useState({
      loginBg: 'https://media.discordapp.net/attachments/1383264716536680462/1424262639520977080/image.png?ex=6921eeb2&is=69209d32&hm=6e787937d99f30ed47dd29df751ff998934d42b5a8d1cedf60f1d877ecfac37e&=&format=webp&quality=lossless&width=466&height=350',
      schoolLogo: 'https://media.discordapp.net/attachments/1383264716536680462/1425320993127268492/Diseno_sin_titulo_30.png?ex=69227c9d&is=69212b1d&hm=58b23ca929361cc05e85bd36235cfcfc696b06887350fad5e202438892d8dedf&=&format=webp&quality=lossless&width=1317&height=741',
      sidebarLogo: 'https://media.discordapp.net/attachments/1383264716536680462/1425322396478607410/image_4.png?ex=69227dec&is=69212c6c&hm=036843954144dbc970762b423da8ab79ff65edf955c979734653a0b3e8272857&=&format=webp&quality=lossless&width=864&height=864'
  });

  const toggleDay = (day: string) => { setAttendanceForm(prev => ({ ...prev, days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day] })); };

  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-slate-950 min-h-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full max-w-[1080px] px-8 py-8 flex flex-col">
        <HeroHeader 
          title="Configuración del Sistema" 
          subtitle="Administración de datos escolares, horarios y preferencias globales"
          icon={Settings}
          gradient="bg-gradient-to-r from-slate-700 to-slate-900"
          decorativeIcon={Sliders}
        />
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button onClick={() => setActiveTab('school')} className={`p-4 rounded-xl border-2 text-left transition-all ${activeTab === 'school' ? 'border-blue-600 bg-white dark:bg-slate-800 shadow-md dark:text-white' : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800'}`}><h3 className={`text-sm font-bold uppercase ${activeTab === 'school' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>ESCUELA</h3></button>
          <button onClick={() => setActiveTab('attendance')} className={`p-4 rounded-xl border-2 text-left transition-all ${activeTab === 'attendance' ? 'border-blue-600 bg-white dark:bg-slate-800 shadow-md dark:text-white' : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800'}`}><h3 className={`text-sm font-bold uppercase ${activeTab === 'attendance' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>ASISTENCIA</h3></button>
          <button onClick={() => setActiveTab('visual')} className={`p-4 rounded-xl border-2 text-left transition-all ${activeTab === 'visual' ? 'border-blue-600 bg-white dark:bg-slate-800 shadow-md dark:text-white' : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800'}`}><h3 className={`text-sm font-bold uppercase ${activeTab === 'visual' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>PERSONALIZACIÓN</h3></button>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm">
          <AnimatePresence mode="wait">
            {activeTab === 'school' && (
              <motion.div key="school" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-4 mb-6 uppercase">ESCUELA</h3>
                  <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6 mb-6">
                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Codigo Pais :</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" disabled value="+51" className="w-full h-12 pl-10 pr-4 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-500 dark:text-gray-400 font-medium" /></div></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Celular :</label><div className="relative"><Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="991 454 477" maxLength={9} value={schoolForm.cellphone} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 9) setSchoolForm({...schoolForm, cellphone: val}); }} className="w-full h-12 pl-10 pr-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all dark:text-white" /></div></div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Escuela :</label><div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="I.E FRANCISCO BOLOGNESI" value={schoolForm.name} onChange={(e) => setSchoolForm({...schoolForm, name: e.target.value})} className="w-full h-12 pl-10 pr-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all dark:text-white" /></div></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Direccion :</label><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="AV. FRANCISCO BOLOGNESI S/N" value={schoolForm.address} onChange={(e) => setSchoolForm({...schoolForm, address: e.target.value})} className="w-full h-12 pl-10 pr-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all dark:text-white" /></div></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Director :</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="BERNABE MEDINA ZELA" value={schoolForm.director} onChange={(e) => setSchoolForm({...schoolForm, director: e.target.value})} className="w-full h-12 pl-10 pr-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all dark:text-white" /></div></div>
                  </div>
                  <div className="mt-6 space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Logo de la Institución</label><div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"><Upload size={32} className="text-gray-400 mb-2" /><span className="text-sm text-gray-600 dark:text-gray-400">Seleccionar archivo</span><span className="text-xs text-gray-400 mt-1">Recomendado: PNG transparente</span></div></div>
                </div>
                <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-slate-700"><button className="w-40 h-12 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all">Actualizar</button></div>
              </motion.div>
            )}

            {activeTab === 'attendance' && (
              <motion.div key="attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-4 mb-6 uppercase">ASISTENCIA Y ZONA HORARIA</h3>
                  <div className="space-y-8">
                    <div className="space-y-3"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Selecciones dias de asistencia</label><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'].map((day, i) => { const dayCode = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]; const isChecked = attendanceForm.days.includes(dayCode); return (<label key={day} className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border border-transparent hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"><div onClick={() => toggleDay(dayCode)} className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 group-hover:border-blue-400'}`}>{isChecked && <Check size={14} className="text-white" strokeWidth={3} />}</div><span className="text-sm text-gray-700 dark:text-gray-300">{day}</span></label>); })}</div></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Minutos Tardanza :</label><div className="relative max-w-[200px]"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="number" min="0" max="60" step="5" value={attendanceForm.tardiness} onChange={(e) => setAttendanceForm({...attendanceForm, tardiness: parseInt(e.target.value)})} className="w-full h-12 pl-10 pr-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 dark:text-white" /></div><p className="text-xs text-gray-500 dark:text-gray-400">Tiempo de tolerancia antes de marcar tardanza</p></div>
                    <div className="p-5 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 flex items-center justify-between"><div className="flex items-center gap-3"><MessageCircle className="text-green-600 dark:text-green-400" size={24} /><span className="font-medium text-gray-800 dark:text-gray-200">Notificar whatsapp al pasar Asistencia</span></div><button onClick={() => setAttendanceForm(prev => ({...prev, whatsapp: !prev.whatsapp}))} className="relative w-14 h-8 rounded-full transition-colors duration-200 ease-in-out focus:outline-none" style={{ backgroundColor: attendanceForm.whatsapp ? '#25D366' : '#D1D5DB' }}><span className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out ${attendanceForm.whatsapp ? 'translate-x-6' : 'translate-x-0'}`} /></button></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Seleccione una Zona Horaria</label><div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><select value={attendanceForm.timezone} onChange={(e) => setAttendanceForm({...attendanceForm, timezone: e.target.value})} className="w-full h-12 pl-10 pr-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 appearance-none dark:text-white"><option value="America/Lima">(GMT-05:00) America/Lima</option><option value="America/Bogota">(GMT-05:00) America/Bogota</option><option value="America/New_York">(GMT-04:00) America/New_York</option></select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} /></div></div>
                  </div>
                </div>
                <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-slate-700"><button className="w-40 h-12 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all">Actualizar</button></div>
              </motion.div>
            )}

            {activeTab === 'visual' && (
              <motion.div key="visual" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-4 mb-6 uppercase">PERSONALIZACIÓN VISUAL</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fondo del Login (URL)</label>
                      <div className="relative">
                         <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                         <input 
                           type="text" 
                           placeholder="https://example.com/image.jpg" 
                           value={visualForm.loginBg}
                           onChange={(e) => setVisualForm({...visualForm, loginBg: e.target.value})}
                           className="w-full h-12 pl-10 pr-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all dark:text-white" 
                         />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">URL de la imagen de fondo para la pantalla de inicio de sesión.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Logo del Colegio (Login) (URL)</label>
                      <div className="relative">
                         <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                         <input 
                           type="text" 
                           placeholder="https://example.com/logo.png" 
                           value={visualForm.schoolLogo}
                           onChange={(e) => setVisualForm({...visualForm, schoolLogo: e.target.value})}
                           className="w-full h-12 pl-10 pr-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all dark:text-white" 
                         />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Logo principal que aparece en el formulario de login.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Logo del Sidebar (Sistema) (URL)</label>
                      <div className="relative">
                         <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                         <input 
                           type="text" 
                           placeholder="https://example.com/icon.png" 
                           value={visualForm.sidebarLogo}
                           onChange={(e) => setVisualForm({...visualForm, sidebarLogo: e.target.value})}
                           className="w-full h-12 pl-10 pr-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all dark:text-white" 
                         />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Icono pequeño que aparece en la barra lateral del sistema.</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-slate-700"><button className="w-40 h-12 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all">Guardar Cambios</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}