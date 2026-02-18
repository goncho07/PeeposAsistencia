import { Settings } from '@/lib/api/settings';
import { SettingToggle } from '../shared/SettingToggle';
import { MessageCircle } from 'lucide-react';

interface WhatsAppTabProps {
  settings: Settings;
  onUpdate: (group: keyof Settings, key: string, value: any) => void;
}

export function WhatsAppTab({ settings, onUpdate }: WhatsAppTabProps) {
  return (
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
        <h3 className="text-sm font-semibold mb-3 text-text-primary">
          Eventos de Notificación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { key: 'whatsapp_send_on_entry', label: 'Notificar en entrada', description: 'Envía mensaje al padre cuando el alumno ingresa' },
            { key: 'whatsapp_send_on_exit', label: 'Notificar en salida', description: 'Envía mensaje al padre cuando el alumno sale' },
            { key: 'whatsapp_send_on_absence', label: 'Notificar inasistencias', description: 'Envía mensaje al padre si el alumno no asiste' },
          ].map((item) => (
            <label
              key={item.key}
              className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all hover:shadow-sm bg-background border border-transparent hover:border-border"
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
              <div className="w-5 h-5 mt-0.5 border-2 border-border rounded-md peer-checked:bg-[#25D366] peer-checked:border-[#25D366] flex items-center justify-center transition-all shrink-0">
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
              <div>
                <span className="text-sm font-medium text-text-primary">
                  {item.label}
                </span>
                <p className="text-xs text-text-secondary mt-0.5">
                  {item.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
