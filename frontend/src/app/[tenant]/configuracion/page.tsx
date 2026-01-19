'use client';

import { useState } from 'react';
import { AppLayout } from '@/app/components/layouts/AppLayout';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { ToastContainer } from '@/app/components/ui/base/Toast';
import { Button } from '@/app/components/ui/base';
import { useUserToasts } from '@/app/features/users/hooks';
import {
  Settings as SettingsIcon,
  Save,
  Clock,
  MessageCircle,
  Calendar,
  Shield,
} from 'lucide-react';
import { useSettings } from '@/app/features/settings/hooks';
import {
  WhatsAppTab,
  HorariosTab,
  GeneralTab,
  BimestresTab,
} from '@/app/features/settings/components/tabs';

type TabType = 'whatsapp' | 'horarios' | 'general' | 'bimestres';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('whatsapp');

  const { settings, isLoading, isSaving, updateSetting, saveSettings } =
    useSettings();
  const { toasts, success, error: showError, removeToast } = useUserToasts();

  const handleSave = async () => {
    const result = await saveSettings();
    if (result) {
      success(
        '¡Configuración guardada!',
        'Los cambios se aplicaron correctamente'
      );
    } else {
      showError(
        'Error al guardar',
        'No se pudo guardar la configuración'
      );
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <HeroHeader
          title="Configuración"
          subtitle="Administra las configuraciones del sistema de asistencia"
          icon={SettingsIcon}
          breadcrumbs={[{ label: 'Configuración', icon: SettingsIcon }]}
        />

        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface dark:bg-surface-dark"
            >
              <div className="w-5 h-5 rounded bg-border dark:bg-border-dark animate-pulse" />
              <div className="w-16 h-4 rounded bg-border dark:bg-border-dark animate-pulse" />
            </div>
          ))}
        </div>

        <div className="rounded-xl p-6 bg-surface dark:bg-surface-dark space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-border dark:bg-border-dark rounded animate-pulse" />
              <div className="h-10 bg-background dark:bg-background-dark rounded animate-pulse" />
            </div>
          ))}
        </div>
      </AppLayout>
    );
  }

  if (!settings) {
    return (
      <AppLayout>
        <div className="rounded-xl p-6 bg-surface dark:bg-surface-dark">
          <p className="text-danger">Error al cargar la configuración</p>
        </div>
      </AppLayout>
    );
  }

  const tabs = [
    {
      id: 'whatsapp' as TabType,
      label: 'WhatsApp',
      icon: MessageCircle,
    },
    {
      id: 'horarios' as TabType,
      label: 'Horarios',
      icon: Clock,
    },
    {
      id: 'general' as TabType,
      label: 'General',
      icon: Shield,
    },
    {
      id: 'bimestres' as TabType,
      label: 'Bimestres',
      icon: Calendar,
    },
  ];

  return (
    <AppLayout>
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <HeroHeader
        title="Configuración"
        subtitle="Administra las configuraciones del sistema de asistencia"
        icon={SettingsIcon}
        breadcrumbs={[{ label: 'Configuración', icon: SettingsIcon }]}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary dark:bg-primary-light text-white shadow-md'
                  : 'bg-surface dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark hover:bg-surface-hover dark:hover:bg-surface-hover-dark'
              }`}
            >
              <TabIcon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="transition-opacity duration-200">
        {activeTab === 'whatsapp' && (
          <WhatsAppTab settings={settings} onUpdate={updateSetting} />
        )}
        {activeTab === 'horarios' && (
          <HorariosTab settings={settings} onUpdate={updateSetting} />
        )}
        {activeTab === 'general' && (
          <GeneralTab settings={settings} onUpdate={updateSetting} />
        )}
        {activeTab === 'bimestres' && (
          <BimestresTab settings={settings} onUpdate={updateSetting} />
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          variant="primary"
          onClick={handleSave}
          loading={isSaving}
          icon={<Save className="w-5 h-5" />}
          className="px-6 py-3"
        >
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </AppLayout>
  );
}
