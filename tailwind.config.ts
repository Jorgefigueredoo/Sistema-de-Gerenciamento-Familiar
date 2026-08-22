import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /**
         * Superfícies dirigidas por variável CSS. O tema escuro troca a
         * variável, então QUALQUER opacidade (`bg-surface/70`) acompanha
         * sozinha — o que uma lista de classes literais nunca cobriria.
         */
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        sunken: 'rgb(var(--sunken) / <alpha-value>)',
        hairline: 'rgb(var(--hairline) / <alpha-value>)',
        /** Véu para realces sutis: tinta no claro, luz no escuro. */
        veil: 'rgb(var(--veil) / <alpha-value>)',

        /**
         * A cor do app vem das categorias. O "chrome" (botões, seleção,
         * navegação) é tinta quente quase preta, para não brigar com elas
         * e para o app não ter cara de template de framework.
         */
        brand: {
          50: '#faf6f1',
          100: '#f1e8dd',
          200: '#e0cfba',
          300: '#c6ad90',
          400: '#a68465',
          500: '#836248',
          600: '#654832',
          700: '#4c3625',
          800: '#33241a',
          900: '#211710',
        },
        // Dourado de apoio: usado só em destaques pequenos ("hoje", foco).
        accent: {
          50: '#fff9e8',
          100: '#ffefc4',
          200: '#ffdf8f',
          300: '#fcc94f',
          400: '#f0b016',
          500: '#d29408',
          600: '#a97406',
          700: '#845a06',
        },
        // Papel: o fundo é creme, não o cinza-azulado de sempre.
        paper: {
          50: '#fffcf7',
          100: '#fdf6ec',
          200: '#f8eddd',
          300: '#f0e0c9',
        },
        // Neutros quentes, puxados para o marrom em vez do azul.
        ink: {
          50: '#faf7f3',
          100: '#f2ede5',
          200: '#e6ded2',
          300: '#d2c5b5',
          400: '#a79a89',
          500: '#7d7163',
          600: '#5c5246',
          700: '#443c32',
          800: '#2c261e',
          900: '#1a1610',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // "Adesivo": uma aba sólida embaixo, sem o borrão genérico.
        sticker: '0 3px 0 0 rgb(58 42 26 / 0.10), 0 8px 20px -12px rgb(58 42 26 / 0.45)',
        stickerLg: '0 5px 0 0 rgb(58 42 26 / 0.12), 0 16px 32px -16px rgb(58 42 26 / 0.5)',
        soft: '0 1px 2px rgb(58 42 26 / 0.05), 0 4px 14px -6px rgb(58 42 26 / 0.14)',
        lift: '0 2px 4px rgb(58 42 26 / 0.06), 0 14px 34px -12px rgb(58 42 26 / 0.28)',
        nav: '0 -2px 24px -10px rgb(58 42 26 / 0.35)',
      },
      borderRadius: {
        '4xl': '1.75rem',
        '5xl': '2.25rem',
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
        rise: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        festa: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'fade-in 180ms ease-out',
        'pop-in': 'pop-in 240ms cubic-bezier(0.22, 1, 0.36, 1)',
        rise: 'rise 320ms cubic-bezier(0.22, 1, 0.36, 1) both',
        festa: 'festa 500ms ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
