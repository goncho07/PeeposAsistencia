import { useEffect, useState } from 'react';
import { settingsService, Settings } from '@/lib/api/settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await settingsService.getAll();
      setSettings(data);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('No se pudo cargar la configuración del sistema');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setIsSaving(true);
      setError(null);
      await settingsService.update(settings);
      return true;
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.response?.data?.message || 'No se pudo guardar la configuración');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (group: keyof Settings, key: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [group]: {
        ...settings[group],
        [key]: value,
      },
    });
  };

  return {
    settings,
    isLoading,
    isSaving,
    error,
    updateSetting,
    saveSettings,
    loadSettings,
  };
}
