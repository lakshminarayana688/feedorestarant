/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'Plus Jakarta Sans', 'sans-serif'],
        heading: ['General Sans', 'sans-serif'],
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      colors: {
        feedo: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FFC700', // Primary FEEDO Yellow
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        brand: {
          green:   '#10b981',
          emerald: '#059669',
          amber:   '#f59e0b',
          red:     '#ef4444',
          blue:    '#3b82f6',
          dark:    '#0f172a',
          surface: '#1e293b',
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow':  'bounce 2s infinite',
        'spin-slow':    'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
