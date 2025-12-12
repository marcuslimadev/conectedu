/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilita dark mode via classe 'dark' no HTML
  content: [
    "./frontend/**/*.{html,js,vue}",
    "./index.html",
    "./*.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3b82f6',
          'primary-dark': '#2563eb',
          'primary-light': '#60a5fa',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
      fontFamily: {
        'comic': ['Comic Neue', 'cursive'],
        'sans': ['Comic Neue', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  safelist: [
    // Cores dinâmicas usadas no sistema
    'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-red-100',
    'text-blue-800', 'text-green-800', 'text-yellow-800', 'text-red-800',
    'border-blue-300', 'border-green-300', 'border-yellow-300', 'border-red-300',
    // Estados e animações
    'animate-spin', 'animate-pulse', 'animate-bounce',
    // Utilidades de layout
    'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4',
    'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4',
    // Responsividade
    'sm:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-4', 'xl:grid-cols-5',
    // Status badges
    'bg-emerald-100', 'text-emerald-800', 'bg-amber-100', 'text-amber-800',
    'bg-rose-100', 'text-rose-800', 'bg-slate-100', 'text-slate-800'
  ]
}