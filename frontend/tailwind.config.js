// Configuración de Tailwind CSS v4 para la Pokédex PWA
// Fecha: 05/02/2026

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azul agua (cyan) para tema principal
        aqua: {
          50: '#f0f9fa',
          100: '#e1f3f5',
          200: '#b3e5eb',
          300: '#85d7e0',
          400: '#57c9d5',
          500: '#0891b2',
          600: '#0a8fa3',
          700: '#0d7a94',
          800: '#106685',
          900: '#125276',
        },
        // Colores específicos para estados offline
        offline: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'sync': 'sync 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        sync: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      }
    },
  },
  plugins: [],
}
