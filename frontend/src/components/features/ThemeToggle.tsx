import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const [darkMode, setDarkMode] = useState(false);

    // In a real application you would use a context or a hook to manage this properly
    // and effect the 'dark' class on the HTML or Body element.
    const toggle = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    }

    return (
        <button 
          onClick={toggle}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}

export default ThemeToggle;