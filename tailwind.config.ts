import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Rosa da marca
        brand: {
          50: '#fff1f6',
          100: '#ffe4ee',
          200: '#fecdde',
          300: '#fda4c4',
          400: '#fb6fa2',
          500: '#f43f7f',
          600: '#e11d62',
          700: '#be1250',
          800: '#9d1246',
          900: '#851340',
        },
        // Violeta de apoio, usado nos gradientes
        accent: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // Neutros levemente quentes: menos frios que o slate puro
        ink: {
          50: '#f9f8fb',
          100: '#f2f0f6',
          200: '#e7e4ee',
          300: '#d3cfdd',
          400: '#a29db2',
          500: '#7b7589',
          600: '#5b5568',
          700: '#443f4f',
          800: '#2d2937',
          900: '#1b1822',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(27, 24, 34, 0.04), 0 4px 16px -4px rgba(27, 24, 34, 0.08)',
        lift: '0 2px 4px rgba(27, 24, 34, 0.04), 0 12px 32px -8px rgba(27, 24, 34, 0.14)',
        glow: '0 8px 24px -6px rgba(225, 29, 98, 0.45)',
        nav: '0 -1px 2px rgba(27, 24, 34, 0.03), 0 -8px 32px -12px rgba(27, 24, 34, 0.18)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '70%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'rise': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'fade-in 180ms ease-out',
        'pop-in': 'pop-in 240ms cubic-bezier(0.22, 1, 0.36, 1)',
        rise: 'rise 320ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
