/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.js',
        './resources/js/**/*.tsx',
        './resources/js/**/*.ts',
    ],
    safelist: [
        // Clase raíz del modo oscuro
        'dark',
        // Todos los patrones dark: (fuerza que Tailwind nunca los purgue)
        { pattern: /^dark:/ },
        // Grises en todos los tonos (light y dark)
        { pattern: /^bg-gray-(50|100|200|300|400|500|600|700|800|900)$/ },
        { pattern: /^dark:bg-gray-(50|100|200|300|400|500|600|700|800|900)$/ },
        { pattern: /^text-gray-(50|100|200|300|400|500|600|700|800|900)$/ },
        { pattern: /^dark:text-gray-(50|100|200|300|400|500|600|700|800|900)$/ },
        { pattern: /^border-gray-(100|200|300|400|500|600|700|800)$/ },
        { pattern: /^dark:border-gray-(100|200|300|400|500|600|700|800)$/ },
        // Morados en todos los tonos (light y dark)
        { pattern: /^bg-purple-(50|100|200|300|400|500|600|700|800|900)$/ },
        { pattern: /^dark:bg-purple-(50|100|200|300|400|500|600|700|800|900)$/ },
        { pattern: /^text-purple-(50|100|200|300|400|500|600|700|800|900)$/ },
        { pattern: /^dark:text-purple-(50|100|200|300|400|500|600|700|800|900)$/ },
        { pattern: /^border-purple-(100|200|300|400|500|600|700|800)$/ },
        { pattern: /^dark:border-purple-(100|200|300|400|500|600|700|800)$/ },
        // Hover en modo oscuro
        { pattern: /^dark:hover:/ },
        // Clases individuales críticas que usan slash (opacidad)
        'dark:bg-purple-900/30',
        'dark:bg-purple-900/20',
        'dark:bg-purple-900/40',
        'dark:bg-purple-900/50',
        'dark:bg-red-900/20',
        'dark:bg-blue-900/50',
        'dark:bg-green-900/50',
        'dark:hover:bg-purple-900/20',
        'dark:hover:bg-purple-900/30',
        'dark:hover:bg-purple-900/50',
        'dark:bg-gray-900/60',
        // Divide y ring en modo oscuro
        'dark:divide-gray-700',
        'dark:ring-primary-600',
        // Asistencia — botones de estado activo
        'bg-green-500', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500',
        'ring-green-300', 'ring-red-300', 'ring-yellow-300', 'ring-blue-300',
        // Asistencia — filas de tabla
        'bg-red-50/50', 'bg-yellow-50/50', 'bg-blue-50/50',
        'dark:bg-red-900/10', 'dark:bg-yellow-900/10', 'dark:bg-blue-900/10',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Paleta morada institucional principal
                primary: {
                    50:  '#F5F0FF',
                    100: '#EDE9FE',
                    200: '#DDD6FE',
                    300: '#C4B5FD',
                    400: '#A855F7',
                    500: '#8B44D4',
                    600: '#6B2FBF',
                    700: '#4A1B8C',
                    800: '#3B1570',
                    900: '#2D1B69',
                    950: '#1E0F4A',
                },
                // Grises institucionales
                secondary: {
                    50:  '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                },
                // Morado claro de acento
                accent: {
                    50:  '#FAF5FF',
                    100: '#F3E8FF',
                    200: '#E9D5FF',
                    300: '#D8B4FE',
                    400: '#C084FC',
                    500: '#A855F7',
                },
                // Fondo lavanda institucional
                canvas: '#F8F7FF',
            },
            backgroundImage: {
                'gradient-institutional': 'linear-gradient(135deg, #2D1B69 0%, #4A1B8C 40%, #6B2FBF 100%)',
            },
        },
    },
    plugins: [],
};
