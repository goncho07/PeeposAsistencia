import { Settings } from '@/lib/api/settings';
import { Shield } from 'lucide-react';
import { TabHeader } from '../shared/TabHeader';
import { SettingToggle } from '../shared/SettingToggle';
import { Input } from '@/app/components/ui/base';

interface GeneralTabProps {
  settings: Settings;
  onUpdate: (group: keyof Settings, key: string, value: any) => void;
}

export function GeneralTab({ settings, onUpdate }: GeneralTabProps) {
  return (
    <div className="rounded-xl p-6 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm">
      <TabHeader
        icon={Shield}
        title="Configuración General"
        description="Parámetros generales del sistema de asistencia"
        iconBgColor="bg-gradient-to-br from-purple-500 to-purple-700"
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Tolerancia de tardanza (minutos)"
              type="number"
              min="0"
              max="30"
              value={settings.general.tardiness_tolerance_minutes.toString()}
              onChange={(value) =>
                onUpdate(
                  'general',
                  'tardiness_tolerance_minutes',
                  parseInt(value)
                )
              }
            />
            <p className="text-xs mt-1.5 text-text-secondary dark:text-text-secondary-dark">
              Minutos de gracia antes de marcar como tardanza
            </p>
          </div>

          <div>
            <Input
              label="Hora de marcado automático de faltas"
              type="time"
              value={settings.general.auto_mark_absences_time}
              onChange={(value) =>
                onUpdate('general', 'auto_mark_absences_time', value)
              }
            />
            <p className="text-xs mt-1.5 text-text-secondary dark:text-text-secondary-dark">
              Hora límite para marcar faltas de forma automática
            </p>
          </div>
        </div>

        <SettingToggle
          icon={Shield}
          label="Marcar faltas automáticamente"
          description="Marca como falta si no hay registro a la hora límite"
          checked={settings.general.auto_mark_absences}
          onChange={(checked) =>
            onUpdate('general', 'auto_mark_absences', checked)
          }
        />
      </div>
    </div>
  );
}
