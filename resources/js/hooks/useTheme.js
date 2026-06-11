import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('ppe-theme') || 'light';
        }
        return 'light';
    });

    const applyTheme = useCallback((newTheme) => {
        const root = document.documentElement;
        if (newTheme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
        }
        localStorage.setItem('ppe-theme', newTheme);
    }, []);

    // Sincroniza en caso de que el estado cambie por otra vía
    useEffect(() => {
        applyTheme(theme);
    }, [theme, applyTheme]);

    const toggle = useCallback(() => {
        setTheme(current => {
            const next = current === 'light' ? 'dark' : 'light';
            applyTheme(next); // aplica INMEDIATAMENTE, sin esperar re-render
            return next;
        });
    }, [applyTheme]);

    return { theme, toggle, isDark: theme === 'dark' };
}
