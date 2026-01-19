import { Settings } from '@/lib/api/settings';
import { MessageCircle } from 'lucide-react';
import { TabHeader } from '../shared/TabHeader';
import { SettingToggle } from '../shared/SettingToggle';
import { Input } from '@/app/components/ui/base';

interface WhatsAppTabProps {
  settings: Settings;
  onUpdate: (group: keyof Settings, key: string, value: any) => void;
}

export function WhatsAppTab({ settings, onUpdate }: WhatsAppTabProps) {
  return (
    <div className="rounded-xl p-6 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm">
      <TabHeader
        icon={MessageCircle}
        title="Notificaciones WhatsApp"
        description="Configura los números de WhatsApp y las notificaciones automáticas"
        iconBgColor="bg-[#25D366]"
      />

      <div className="space-y-6">
        <SettingToggle
          icon={MessageCircle}
          label="Notificaciones WhatsApp"
          description={
            settings.whatsapp.whatsapp_notifications_enabled
              ? 'Activado'
              : 'Desactivado'
          }
          checked={settings.whatsapp.whatsapp_notifications_enabled}
          onChange={(checked) =>
            onUpdate('whatsapp', 'whatsapp_notifications_enabled', checked)
          }
          activeColor="bg-[#25D366]"
        />

        <div>
          <h3 className="text-base font-semibold mb-3 text-text-primary dark:text-text-primary-dark">
            Números de WhatsApp por Nivel
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nivel Inicial"
              type="text"
              placeholder="+51 999 999 999"
              value={settings.whatsapp.whatsapp_inicial_phone}
              onChange={(value) =>
                onUpdate('whatsapp', 'whatsapp_inicial_phone', value)
              }
            />
            <Input
              label="Nivel Primaria"
              type="text"
              placeholder="+51 999 999 999"
              value={settings.whatsapp.whatsapp_primaria_phone}
              onChange={(value) =>
                onUpdate('whatsapp', 'whatsapp_primaria_phone', value)
              }
            />
            <Input
              label="Nivel Secundaria"
              type="text"
              placeholder="+51 999 999 999"
              value={settings.whatsapp.whatsapp_secundaria_phone}
              onChange={(value) =>
                onUpdate('whatsapp', 'whatsapp_secundaria_phone', value)
              }
            />
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-3 text-text-primary dark:text-text-primary-dark">
            Eventos de Notificación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { key: 'whatsapp_send_on_entry', label: 'Notificar en entrada' },
              { key: 'whatsapp_send_on_exit', label: 'Notificar en salida' },
              {
                key: 'whatsapp_send_on_absence',
                label: 'Notificar inasistencias',
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:shadow-sm bg-background dark:bg-background-dark"
              >
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={
                    settings.whatsapp[
                      item.key as keyof typeof settings.whatsapp
                    ] as boolean
                  }
                  onChange={(e) =>
                    onUpdate('whatsapp', item.key, e.target.checked)
                  }
                />
                <div className="w-5 h-5 border-2 border-border dark:border-border-dark rounded-md peer-checked:bg-[#25D366] peer-checked:border-[#25D366] flex items-center justify-center transition-all">
                  <svg
                    className="w-3 h-3 text-white hidden peer-checked:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium flex-1 text-text-primary dark:text-text-primary-dark">
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
