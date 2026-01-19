import { Settings } from '@/lib/api/settings';
import { Clock } from 'lucide-react';
import { TabHeader } from '../shared/TabHeader';
import { Input } from '@/app/components/ui/base';

interface HorariosTabProps {
  settings: Settings;
  onUpdate: (group: keyof Settings, key: string, value: any) => void;
}

export function HorariosTab({ settings, onUpdate }: HorariosTabProps) {
  const levels = [
    { level: 'inicial', label: 'Nivel Inicial' },
    { level: 'primaria', label: 'Nivel Primaria' },
    { level: 'secundaria', label: 'Nivel Secundaria' },
  ];

  return (
    <div className="rounded-xl p-6 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm">
      <TabHeader
        icon={Clock}
        title="Horarios de Asistencia"
        description="Define los horarios de entrada y salida por nivel educativo"
        iconBgColor="bg-gradient-to-br from-blue-500 to-blue-700"
      />

      <div className="space-y-6">
        {levels.map(({ level, label }) => (
          <div
            key={level}
            className="p-5 rounded-xl bg-background dark:bg-background-dark"
          >
            <h3 className="text-lg font-semibold mb-4 text-text-primary dark:text-text-primary-dark">
              {label}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Entrada - Turno Mañana"
                type="time"
                value={
                  settings.horarios[`horario_${level}_manana_entrada`] || '08:00'
                }
                onChange={(value) =>
                  onUpdate('horarios', `horario_${level}_manana_entrada`, value)
                }
              />
              <Input
                label="Salida - Turno Mañana"
                type="time"
                value={
                  settings.horarios[`horario_${level}_manana_salida`] || '13:00'
                }
                onChange={(value) =>
                  onUpdate('horarios', `horario_${level}_manana_salida`, value)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
