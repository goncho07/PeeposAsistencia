'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Sliders,
  Check,
  Clock,
  MessageCircle,
  Globe,
  ChevronDown
} from 'lucide-react'
import HeroHeader from '@/components/ui/HeroHeader'
import api from '@/lib/axios'
import Toast from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
}

const dayMap: Record<string, string> = {
  lunes: 'Mon',
  martes: 'Tue',
  miercoles: 'Wed',
  jueves: 'Thu',
  viernes: 'Fri',
  sabado: 'Sat',
  domingo: 'Sun'
}
const reverseDayMap: Record<string, string> = Object.fromEntries(
  Object.entries(dayMap).map(([k, v]) => [v, k])
)

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'bimestres' | 'horarios'>('attendance')
  const [loading, setLoading] = useState(false)

  const [attendanceForm, setAttendanceForm] = useState({
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    tardiness: 5,
    whatsapp: true,
    timezone: 'America/Lima'
  })
  const [bimestres, setBimestres] = useState<any>({})
  const [horarios, setHorarios] = useState<any>({})

  const { message, type, isVisible, showToast, hideToast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings')
      console.log('settings:', data)

      const general = data.general || {}
      const whatsapp = data.whatsapp || {}
      const horariosData = data.horarios || {}
      const bimestresData = data.bimestres || {}

      setAttendanceForm({
        days:
          (general.attendance_days || [
            'lunes',
            'martes',
            'miercoles',
            'jueves',
            'viernes'
          ]).map((d: string) => dayMap[d.toLowerCase()] || 'Mon'),
        tardiness: general.tardiness_tolerance_minutes || 5,
        whatsapp: whatsapp.whatsapp_notifications_enabled ?? true,
        timezone: general.timezone || 'America/Lima'
      })

      setHorarios(horariosData)
      setBimestres(bimestresData)
    } catch (err) {
      console.error(err)
      showToast('Error al cargar configuración', 'error')
    }
  }

  const toggleDay = (day: string) => {
    setAttendanceForm(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }))
  }

  const handleUpdateSettings = async () => {
    try {
      setLoading(true)

      const payload = {
        // General
        attendance_days: attendanceForm.days.map(d => reverseDayMap[d] || 'lunes'),
        tardiness_tolerance_minutes: attendanceForm.tardiness,
        timezone: attendanceForm.timezone,

        // WhatsApp
        whatsapp_notifications_enabled: attendanceForm.whatsapp,

        // Horarios
        horario_inicial_entrada: horarios.horario_inicial_entrada,
        horario_inicial_salida: horarios.horario_inicial_salida,
        horario_primaria_entrada: horarios.horario_primaria_entrada,
        horario_primaria_salida: horarios.horario_primaria_salida,
        horario_secundaria_entrada: horarios.horario_secundaria_entrada,
        horario_secundaria_salida: horarios.horario_secundaria_salida,

        // Bimestres
        bimestre_1_inicio: bimestres.bimestre_1_inicio,
        bimestre_1_fin: bimestres.bimestre_1_fin,
        bimestre_2_inicio: bimestres.bimestre_2_inicio,
        bimestre_2_fin: bimestres.bimestre_2_fin,
        bimestre_3_inicio: bimestres.bimestre_3_inicio,
        bimestre_3_fin: bimestres.bimestre_3_fin,
        bimestre_4_inicio: bimestres.bimestre_4_inicio,
        bimestre_4_fin: bimestres.bimestre_4_fin
      }

      console.log('updating settings with payload:', payload)
      await api.put('/settings', { settings: payload })
      showToast('Configuración actualizada', 'success')
      await fetchSettings()
    } catch (err: any) {
      console.error(err)
      showToast('Error al actualizar configuración', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex justify-center bg-gray-50 dark:bg-slate-950 min-h-full">
      <Toast message={message} type={type} isVisible={isVisible} onClose={hideToast} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-[1080px] px-8 py-8 flex flex-col"
      >
        <HeroHeader
          title="Configuración del Sistema"
          subtitle="Administración de horarios, bimestres y preferencias globales"
          icon={Settings}
          gradient="bg-gradient-to-r from-slate-700 to-slate-900"
          decorativeIcon={Sliders}
        />

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { key: 'attendance', label: 'ASISTENCIA' },
            { key: 'bimestres', label: 'BIMESTRES' },
            { key: 'horarios', label: 'HORARIOS' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${activeTab === tab.key
                  ? 'border-blue-600 bg-white dark:bg-slate-800 shadow-md dark:text-white'
                  : 'border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800'
                }`}
            >
              <h3
                className={`text-sm font-bold uppercase ${activeTab === tab.key
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                  }`}
              >
                {tab.label}
              </h3>
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm">
          <AnimatePresence mode="wait">
            {activeTab === 'attendance' && (
              <motion.div
                key="attendance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-4 mb-6 uppercase">
                  ASISTENCIA Y ZONA HORARIA
                </h3>

                {/* Attendance Days */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Seleccione días de asistencia
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(
                      (day, i) => {
                        const codes = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                        const code = codes[i]
                        const checked = attendanceForm.days.includes(code)
                        return (
                          <label
                            key={day}
                            className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border border-transparent hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => toggleDay(code)}
                          >
                            <div
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 group-hover:border-blue-400'
                                }`}
                            >
                              {checked && <Check size={14} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{day}</span>
                          </label>
                        )
                      }
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Minutos de Tardanza
                  </label>
                  <div className="relative max-w-[200px]">
                    <Clock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="number"
                      min="0"
                      max="60"
                      step="5"
                      value={attendanceForm.tardiness}
                      onChange={e =>
                        setAttendanceForm({ ...attendanceForm, tardiness: parseInt(e.target.value) })
                      }
                      className="w-full h-12 pl-10 pr-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="text-green-600 dark:text-green-400" size={24} />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      Notificar por WhatsApp al pasar asistencia
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setAttendanceForm(prev => ({ ...prev, whatsapp: !prev.whatsapp }))
                    }
                    className="relative w-14 h-8 rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
                    style={{
                      backgroundColor: attendanceForm.whatsapp ? '#25D366' : '#D1D5DB'
                    }}
                  >
                    <span
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out ${attendanceForm.whatsapp ? 'translate-x-6' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Seleccione Zona Horaria
                  </label>
                  <div className="relative">
                    <Globe
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <select
                      value={attendanceForm.timezone}
                      onChange={e =>
                        setAttendanceForm({ ...attendanceForm, timezone: e.target.value })
                      }
                      className="w-full h-12 pl-10 pr-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 appearance-none dark:text-white"
                    >
                      <option value="America/Lima">(GMT-05:00) America/Lima</option>
                      <option value="America/Bogota">(GMT-05:00) America/Bogota</option>
                      <option value="America/New_York">(GMT-04:00) America/New_York</option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'bimestres' && (
              <motion.div
                key="bimestres"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-4 mb-6 uppercase">
                  CONFIGURACIÓN DE BIMESTRES
                </h3>

                {Array.from({ length: 4 }).map((_, i) => {
                  const num = i + 1
                  return (
                    <div key={num} className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Bimestre {num} - Inicio
                        </label>
                        <input
                          type="date"
                          value={bimestres[`bimestre_${num}_inicio`] || ''}
                          onChange={e =>
                            setBimestres({
                              ...bimestres,
                              [`bimestre_${num}_inicio`]: e.target.value
                            })
                          }
                          className="w-full h-10 px-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Bimestre {num} - Fin
                        </label>
                        <input
                          type="date"
                          value={bimestres[`bimestre_${num}_fin`] || ''}
                          onChange={e =>
                            setBimestres({
                              ...bimestres,
                              [`bimestre_${num}_fin`]: e.target.value
                            })
                          }
                          className="w-full h-10 px-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                        />
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            )}

            {activeTab === 'horarios' && (
              <motion.div
                key="horarios"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-4 mb-6 uppercase">
                  HORARIOS POR NIVEL
                </h3>

                {['inicial', 'primaria', 'secundaria'].map(level => (
                  <div key={level} className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {level.toUpperCase()} - Entrada
                      </label>
                      <input
                        type="time"
                        value={horarios[`horario_${level}_entrada`] || ''}
                        onChange={e =>
                          setHorarios({
                            ...horarios,
                            [`horario_${level}_entrada`]: e.target.value
                          })
                        }
                        className="w-full h-10 px-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {level.toUpperCase()} - Salida
                      </label>
                      <input
                        type="time"
                        value={horarios[`horario_${level}_salida`] || ''}
                        onChange={e =>
                          setHorarios({
                            ...horarios,
                            [`horario_${level}_salida`]: e.target.value
                          })
                        }
                        className="w-full h-10 px-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-slate-700 mt-8">
            <button
              onClick={handleUpdateSettings}
              disabled={loading}
              className="w-40 h-12 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all disabled:opacity-70"
            >
              {loading ? 'Guardando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
