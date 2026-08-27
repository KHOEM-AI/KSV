/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#06080f',
          900: '#0a0e1a',
          850: '#0e1320',
          800: '#121829',
          750: '#171e33',
          700: '#1d2540',
          600: '#2a3454',
          500: '#3a4666',
          400: '#5a6788',
          300: '#8a96b5',
          200: '#b8c2d8',
          100: '#dde4f0',
        },
        brand: {
          50: '#e6f4ff',
          100: '#cce9ff',
          200: '#99d3ff',
          300: '#5ab8ff',
          400: '#2a9dff',
          500: '#0a82f5',
          600: '#0066d4',
          700: '#0050aa',
          800: '#003d80',
          900: '#002a5c',
        },
        accent: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        success: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(42,157,255,0.15), 0 8px 30px -8px rgba(10,130,245,0.35)',
        'glow-sm': '0 0 0 1px rgba(42,157,255,0.10), 0 4px 16px -6px rgba(10,130,245,0.25)',
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.3)', opacity: '0' },
          '100%': { opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'slide-in': 'slide-in 0.3s ease-out both',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
};
