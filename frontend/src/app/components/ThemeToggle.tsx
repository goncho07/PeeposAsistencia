'use client';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors hover:bg-surface-hover active:scale-95 cursor-pointer"
      aria-label="Cambiar tema"
      title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
    >
      {theme === 'light' ? (
        <Moon className="w-7 h-7 text-text-secondary" />
      ) : (
        <Sun className="w-7 h-7 text-text-secondary" />
      )}
    </button>
  );
}
