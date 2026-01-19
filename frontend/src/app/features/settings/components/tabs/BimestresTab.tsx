import { Settings } from '@/lib/api/settings';
import { Calendar } from 'lucide-react';
import { TabHeader } from '../shared/TabHeader';
import { Input } from '@/app/components/ui/base';

interface BimestresTabProps {
  settings: Settings;
  onUpdate: (group: keyof Settings, key: string, value: any) => void;
}

export function BimestresTab({ settings, onUpdate }: BimestresTabProps) {
  return (
    <div className="rounded-xl p-6 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm">
      <TabHeader
        icon={Calendar}
        title="Períodos Bimestrales"
        description="Define las fechas de inicio y fin de cada bimestre del año escolar"
        iconBgColor="bg-gradient-to-br from-orange-500 to-orange-700"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((num) => (
          <div
            key={num}
            className="p-5 rounded-xl bg-background dark:bg-background-dark"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-text-primary dark:text-text-primary-dark">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-orange-500 to-orange-700">
                {num}
              </span>
              <span>Bimestre {num}</span>
            </h3>
            <div className="space-y-3">
              <Input
                label="Fecha de inicio"
                type="date"
                value={
                  settings.bimestres[
                    `bimestre_${num}_inicio` as keyof typeof settings.bimestres
                  ]
                }
                onChange={(value) =>
                  onUpdate('bimestres', `bimestre_${num}_inicio`, value)
                }
              />
              <Input
                label="Fecha de fin"
                type="date"
                value={
                  settings.bimestres[
                    `bimestre_${num}_fin` as keyof typeof settings.bimestres
                  ]
                }
                onChange={(value) =>
                  onUpdate('bimestres', `bimestre_${num}_fin`, value)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
