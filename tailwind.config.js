/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./context/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
        "./index.tsx"
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0891B2', // Cyan-600
                    hover: '#0E7490',   // Cyan-700
                    light: '#22D3EE',   // Cyan-400
                    bg: '#ECFEFF',      // Cyan-50
                },
                secondary: {
                    DEFAULT: '#22D3EE',
                },
                cta: {
                    DEFAULT: '#22C55E', // Green-500
                    hover: '#16A34A',   // Green-600
                },
                // Pop Accents (Hybrid Design)
                pop: {
                    yellow: '#FACC15', // Yellow-400
                    pink: '#F472B6',   // Pink-400
                    purple: '#A855F7', // Purple-500
                    cyan: '#22D3EE',   // Cyan-400
                },
                text: {
                    main: '#164E63',    // Cyan-900
                    muted: '#475569',   // Slate-600
                }
            },
            fontFamily: {
                sans: ['"Fira Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['"Fira Code"', 'ui-monospace', 'monospace'],
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(8, 145, 178, 0.1), 0 2px 4px -1px rgba(8, 145, 178, 0.06)',
                'card': '0 0 0 1px rgba(8, 145, 178, 0.05), 0 2px 8px rgba(0, 0, 0, 0.05)',
                'pop': '4px 4px 0px 0px rgba(8, 145, 178, 0.2)', // Hybrid shadow
            }
        },
    },
    plugins: [],
}
