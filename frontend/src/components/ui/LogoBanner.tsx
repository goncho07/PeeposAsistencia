import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function LoginBanner() {
    const { darkMode } = useTheme();
    const logoSrc = darkMode ? '/images/banner_palma_white.png' : '/images/banner_palma_black.png';

    return (
        <div className="text-center">
            <img
                src={logoSrc}
                alt="School Logo"
                className="mx-auto h-48 mb-8 object-contain transition-transform hover:scale-105 duration-500"
            />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Iniciar Sesión</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Ingresa a tu panel de control institucional
            </p>
        </div>
    );
}
