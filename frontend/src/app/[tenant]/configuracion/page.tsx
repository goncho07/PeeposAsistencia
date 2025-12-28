'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/app/components/layouts/DashboardLayout';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { ToastContainer } from '@/app/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
import { Settings as SettingsIcon, Save, Loader2, Clock, MessageCircle, Calendar, Shield } from 'lucide-react';
import { settingsService, Settings as SettingsType } from '@/lib/api/settings';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'whatsapp' | 'horarios' | 'general' | 'bimestres';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('whatsapp');
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toasts, success, error: showError, removeToast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.getAll();
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
      showError('Error al cargar', 'No se pudo cargar la configuración del sistema');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      await settingsService.update(settings);
      success('¡Configuración guardada!', 'Los cambios se aplicaron correctamente');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      showError('Error al guardar', err.response?.data?.message || 'No se pudo guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (group: keyof SettingsType, key: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [group]: {
        ...settings[group],
        [key]: value
      }
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <HeroHeader
          title="Configuración"
          subtitle="Administra las configuraciones del sistema de asistencia"
          icon={SettingsIcon}
          breadcrumbs={[
            { label: 'Configuración', icon: SettingsIcon }
          ]}
        />

        {/* Skeleton tabs */}
        <div className="tabs-container">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="tab-button">
              <div className="w-5 h-5 rounded bg-gray-300 animate-pulse" />
              <div className="w-16 h-4 rounded bg-gray-300 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Skeleton content */}
        <div className="card space-y-6">
          <div className="space-y-3">
            <div className="h-6 w-48 bg-gray-300 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-100">
                <div className="h-4 w-32 bg-gray-300 rounded animate-pulse mb-2" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!settings) {
    return (
      <DashboardLayout>
        <div className="card">
          <p style={{ color: 'var(--color-danger)' }}>Error al cargar la configuración</p>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'whatsapp' as TabType, label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
    { id: 'horarios' as TabType, label: 'Horarios', icon: Clock, color: '#3b82f6' },
    { id: 'general' as TabType, label: 'General', icon: Shield, color: '#8b5cf6' },
    { id: 'bimestres' as TabType, label: 'Bimestres', icon: Calendar, color: '#f97316' },
  ];

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <HeroHeader
        title="Configuración"
        subtitle="Administra las configuraciones del sistema de asistencia"
        icon={SettingsIcon}
        breadcrumbs={[
          { label: 'Configuración', icon: SettingsIcon }
        ]}
      />

      <div className="tabs-container">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : ''}`}
            >
              <TabIcon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'whatsapp' && (
              <div className="card">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#25D366' }}>
                    <MessageCircle size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      Notificaciones WhatsApp
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Configura los números de WhatsApp y las notificaciones automáticas
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-sm"
                       style={{ backgroundColor: 'var(--color-background)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                           style={{ backgroundColor: settings.whatsapp.whatsapp_notifications_enabled ? '#25D366' : 'var(--color-border)' }}>
                        <MessageCircle size={20} className="text-white" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                          Notificaciones WhatsApp
                        </label>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                          {settings.whatsapp.whatsapp_notifications_enabled ? 'Activado' : 'Desactivado'}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.whatsapp.whatsapp_notifications_enabled}
                        onChange={(e) => updateSetting('whatsapp', 'whatsapp_notifications_enabled', e.target.checked)}
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                      Números de WhatsApp por Nivel
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="form-group">
                        <label className="label">Nivel Inicial</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="+51 999 999 999"
                          value={settings.whatsapp.whatsapp_inicial_phone}
                          onChange={(e) => updateSetting('whatsapp', 'whatsapp_inicial_phone', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">Nivel Primaria</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="+51 999 999 999"
                          value={settings.whatsapp.whatsapp_primaria_phone}
                          onChange={(e) => updateSetting('whatsapp', 'whatsapp_primaria_phone', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="label">Nivel Secundaria</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="+51 999 999 999"
                          value={settings.whatsapp.whatsapp_secundaria_phone}
                          onChange={(e) => updateSetting('whatsapp', 'whatsapp_secundaria_phone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                      Eventos de Notificación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { key: 'whatsapp_send_on_entry', label: 'Notificar en entrada' },
                        { key: 'whatsapp_send_on_exit', label: 'Notificar en salida' },
                        { key: 'whatsapp_send_on_absence', label: 'Notificar inasistencias' }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:shadow-sm"
                               style={{ backgroundColor: 'var(--color-background)' }}>
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settings.whatsapp[item.key as keyof typeof settings.whatsapp] as boolean}
                            onChange={(e) => updateSetting('whatsapp', item.key, e.target.checked)}
                          />
                          <div className="w-5 h-5 border-2 rounded-md peer-checked:bg-green-600 peer-checked:border-green-600 flex items-center justify-center transition-all"
                               style={{ borderColor: 'var(--color-border)' }}>
                            <svg className="w-3 h-3 text-white hidden peer-checked:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                          <span className="text-sm font-medium flex-1" style={{ color: 'var(--color-text-primary)' }}>
                              {item.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Horarios Tab */}
            {activeTab === 'horarios' && (
              <div className="card">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br from-blue-500 to-blue-700">
                    <Clock size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      Horarios de Asistencia
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Define los horarios de entrada y salida por nivel educativo
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { level: 'inicial', label: 'Nivel Inicial' },
                    { level: 'primaria', label: 'Nivel Primaria' },
                    { level: 'secundaria', label: 'Nivel Secundaria' }
                  ].map(({ level, label }) => (
                    <div key={level} className="p-5 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                        {label}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group mb-0">
                          <label className="label">Entrada - Turno Mañana</label>
                          <input
                            type="time"
                            className="input input-time"
                            value={settings.horarios[`horario_${level}_manana_entrada`] || '08:00'}
                            onChange={(e) => updateSetting('horarios', `horario_${level}_manana_entrada`, e.target.value)}
                          />
                        </div>
                        <div className="form-group mb-0">
                          <label className="label">Salida - Turno Mañana</label>
                          <input
                            type="time"
                            className="input input-time"
                            value={settings.horarios[`horario_${level}_manana_salida`] || '13:00'}
                            onChange={(e) => updateSetting('horarios', `horario_${level}_manana_salida`, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="card">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br from-purple-500 to-purple-700">
                    <Shield size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      Configuración General
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Parámetros generales del sistema de asistencia
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="label">Tolerancia de tardanza (minutos)</label>
                      <input
                        type="number"
                        className="input"
                        min="0"
                        max="30"
                        value={settings.general.tardiness_tolerance_minutes}
                        onChange={(e) => updateSetting('general', 'tardiness_tolerance_minutes', parseInt(e.target.value))}
                      />
                      <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                        Minutos de gracia antes de marcar como tardanza
                      </p>
                    </div>

                    <div className="form-group">
                      <label className="label">Hora de marcado automático de faltas</label>
                      <input
                        type="time"
                        className="input input-time"
                        value={settings.general.auto_mark_absences_time}
                        onChange={(e) => updateSetting('general', 'auto_mark_absences_time', e.target.value)}
                      />
                      <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                        Hora límite para marcar faltas de forma automática
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                           style={{ backgroundColor: settings.general.auto_mark_absences ? 'var(--color-primary)' : 'var(--color-border)' }}>
                        <Shield size={20} className="text-white" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
                          Marcar faltas automáticamente
                        </label>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                          Marca como falta si no hay registro a la hora límite
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.general.auto_mark_absences}
                        onChange={(e) => updateSetting('general', 'auto_mark_absences', e.target.checked)}
                      />
                      <div className="w-14 h-7 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-1 after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all"
                           style={{
                             backgroundColor: settings.general.auto_mark_absences ? 'var(--color-primary)' : '#d1d5db',
                             boxShadow: 'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)'
                           }}></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Bimestres Tab */}
            {activeTab === 'bimestres' && (
              <div className="card">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br from-orange-500 to-orange-700">
                    <Calendar size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      Períodos Bimestrales
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Define las fechas de inicio y fin de cada bimestre del año escolar
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="p-5 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                              style={{ background: `linear-gradient(135deg, #f97316, #ea580c)` }}>
                          {num}
                        </span>
                        <span>Bimestre {num}</span>
                      </h3>
                      <div className="space-y-3">
                        <div className="form-group mb-0">
                          <label className="label">Fecha de inicio</label>
                          <input
                            type="date"
                            className="input input-date"
                            value={settings.bimestres[`bimestre_${num}_inicio` as keyof typeof settings.bimestres]}
                            onChange={(e) => updateSetting('bimestres', `bimestre_${num}_inicio`, e.target.value)}
                          />
                        </div>
                        <div className="form-group mb-0">
                          <label className="label">Fecha de fin</label>
                          <input
                            type="date"
                            className="input input-date"
                            value={settings.bimestres[`bimestre_${num}_fin` as keyof typeof settings.bimestres]}
                            onChange={(e) => updateSetting('bimestres', `bimestre_${num}_fin`, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
          }}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Guardar Configuración</span>
            </>
          )}
        </motion.button>
      </div>
    </DashboardLayout>
  );
}
