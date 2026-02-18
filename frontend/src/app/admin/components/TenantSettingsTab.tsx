'use client';

import { useState } from 'react';
import { useSettings } from '@/app/features/settings/hooks';
import { Button, Input, Select } from '@/app/components/ui/base';
import { Save, MessageCircle, Clock, Shield, X } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';

export function TenantSettingsTab() {
  const { settings, isLoading, isSaving, error, updateSetting, saveSettings } = useSettings();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['whatsapp']));

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    const result = await saveSettings();
    if (result) {
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
    } else {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3.5 bg-background flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-card animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-28 bg-card animate-pulse rounded" />
                <div className="h-4 w-44 bg-card animate-pulse rounded" />
              </div>
            </div>
            <div className="px-4 pb-4 pt-2 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-5 w-32 bg-card animate-pulse rounded" />
                    <div className="h-11 w-full bg-card animate-pulse rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p className="text-danger">{error || 'No se pudo cargar la configuración'}</p>
      </div>
    );
  }

  const whatsappSummary = settings.whatsapp.whatsapp_notifications_enabled
    ? 'Notificaciones activadas'
    : 'Notificaciones desactivadas';

  const horariosSummary = 'Horarios por nivel educativo';

  const generalSummary = [
    `${settings.general.tardiness_tolerance_minutes} min tolerancia`,
    settings.general.auto_mark_absences ? 'Faltas automáticas' : 'Faltas manuales',
  ].join(' · ');

  const levels = [
    { level: 'inicial', label: 'Nivel Inicial' },
    { level: 'primaria', label: 'Nivel Primaria' },
    { level: 'secundaria', label: 'Nivel Secundaria' },
  ];

  const yesNoOptions = [
    { value: 'true', label: 'Sí' },
    { value: 'false', label: 'No' },
  ];

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium border flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-success/10 text-success border-success/20'
              : 'bg-danger/10 text-danger border-danger/20'
          }`}
        >
          {message.text}
          <button onClick={() => setMessage(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <CollapsibleSection
        icon={MessageCircle}
        title="WhatsApp"
        summary={whatsappSummary}
        isOpen={openSections.has('whatsapp')}
        onToggle={() => toggleSection('whatsapp')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Notificaciones WhatsApp"
            value={settings.whatsapp.whatsapp_notifications_enabled ? 'true' : 'false'}
            onChange={(v) => updateSetting('whatsapp', 'whatsapp_notifications_enabled', v === 'true')}
            options={yesNoOptions}
          />
          <Select
            label="Notificar en entrada"
            value={settings.whatsapp.whatsapp_send_on_entry ? 'true' : 'false'}
            onChange={(v) => updateSetting('whatsapp', 'whatsapp_send_on_entry', v === 'true')}
            options={yesNoOptions}
          />
          <Select
            label="Notificar en salida"
            value={settings.whatsapp.whatsapp_send_on_exit ? 'true' : 'false'}
            onChange={(v) => updateSetting('whatsapp', 'whatsapp_send_on_exit', v === 'true')}
            options={yesNoOptions}
          />
          <Select
            label="Notificar inasistencias"
            value={settings.whatsapp.whatsapp_send_on_absence ? 'true' : 'false'}
            onChange={(v) => updateSetting('whatsapp', 'whatsapp_send_on_absence', v === 'true')}
            options={yesNoOptions}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        icon={Clock}
        title="Horarios"
        summary={horariosSummary}
        isOpen={openSections.has('horarios')}
        onToggle={() => toggleSection('horarios')}
      >
        <div className="space-y-5">
          {levels.map(({ level, label }) => (
            <div key={level}>
              <p className="text-xl font-semibold text-text-primary mb-3 rounded-lg bg-background p-3">{label}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Entrada - Turno Mañana"
                  type="time"
                  value={settings.horarios[`horario_${level}_manana_entrada`] || '08:00'}
                  onChange={(value) => updateSetting('horarios', `horario_${level}_manana_entrada`, value)}
                  required
                />
                <Input
                  label="Salida - Turno Mañana"
                  type="time"
                  value={settings.horarios[`horario_${level}_manana_salida`] || '13:00'}
                  onChange={(value) => updateSetting('horarios', `horario_${level}_manana_salida`, value)}
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        icon={Shield}
        title="General"
        summary={generalSummary}
        isOpen={openSections.has('general')}
        onToggle={() => toggleSection('general')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Tolerancia de tardanza (minutos)"
            type="number"
            min={0}
            max={30}
            value={settings.general.tardiness_tolerance_minutes.toString()}
            onChange={(value) => updateSetting('general', 'tardiness_tolerance_minutes', parseInt(value))}
          />
          <Input
            label="Hora de marcado de faltas"
            type="time"
            value={settings.general.auto_mark_absences_time}
            onChange={(value) => updateSetting('general', 'auto_mark_absences_time', value)}
          />
          <Select
            label="Marcar faltas automáticamente"
            value={settings.general.auto_mark_absences ? 'true' : 'false'}
            onChange={(v) => updateSetting('general', 'auto_mark_absences', v === 'true')}
            options={yesNoOptions}
          />
        </div>
      </CollapsibleSection>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button
          variant="primary"
          onClick={handleSave}
          loading={isSaving}
          icon={<Save size={18} />}
          className="text-xl"
        >
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}
