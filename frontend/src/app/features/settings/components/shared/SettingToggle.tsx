import { LucideIcon } from 'lucide-react';

interface SettingToggleProps {
  icon: LucideIcon;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  activeColor?: string;
}

export function SettingToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
  activeColor = 'bg-primary dark:bg-primary-light',
}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-sm bg-background dark:bg-background-dark">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            checked ? activeColor : 'bg-border dark:bg-border-dark'
          }`}
        >
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <label className="text-sm font-semibold cursor-pointer text-text-primary dark:text-text-primary-dark">
            {label}
          </label>
          <p className="text-xs mt-0.5 text-text-secondary dark:text-text-secondary-dark">
            {description}
          </p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-14 h-7 rounded-full peer transition-colors after:content-[''] after:absolute after:top-0.5 after:start-1 after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary-light/20 ${
            checked
              ? 'bg-primary dark:bg-primary-light'
              : 'bg-border dark:bg-border-dark'
          }`}
        />
      </label>
    </div>
  );
}
