/**
 * BizOS design tokens — "Ledger" design system.
 *
 * One neutral family (ink), one accent (pine), semantic status colors.
 * No purple/blue SaaS gradients anywhere. Accent is locked: pine is the
 * ONLY brand color used for primary actions, active states and highlights.
 *
 * Radius rule (documented, enforced): surfaces = 16px (rounded-2xl),
 * controls = 12px (rounded-xl), status chips = pill (rounded-full).
 * Numbers use font-mono (JetBrains Mono) with tabular figures.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#F7F7F4',
          100: '#EDEDE7',
          200: '#E0E0D6',
          300: '#CBCDBE',
          400: '#A2A493',
          500: '#7B7D6E',
          600: '#5B5D51',
          700: '#43453B',
          800: '#2B2C25',
          900: '#1D1D19',
          950: '#131310',
        },
        pine: {
          50: '#ECF5EF',
          100: '#D7EADF',
          200: '#AFD6BE',
          300: '#7FBF97',
          400: '#3F9E6B',
          500: '#1E8A5A',
          600: '#0E7A4E',
          700: '#0A5F3D',
          800: '#07482F',
          900: '#053522',
        },
        gold: {
          50: '#FBF4E1',
          100: '#F6E7C2',
          200: '#EFD79B',
          400: '#DFA32E',
          500: '#C98F1F',
          800: '#7A5410',
        },
        clay: {
          50: '#FBEDE8',
          100: '#F5DCD1',
          200: '#EBBBA6',
          500: '#C9502F',
          600: '#B03E21',
          700: '#8C3018',
          800: '#5E2010',
        },
        sky: {
          50: '#EAF1FB',
          100: '#D6E3F7',
          200: '#B3CDEF',
          500: '#2F6FCE',
          600: '#2359AC',
          800: '#1B3F7A',
        },
        grape: {
          50: '#F0EBF8',
          100: '#E1D7F1',
          200: '#C6B6E4',
          500: '#7A5BC0',
          800: '#46357C',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        // Tinted to the ink hue — never pure-black drops on light surfaces.
        card: '0 1px 2px rgba(29,29,25,0.05), 0 10px 28px -14px rgba(29,29,25,0.18)',
        pop: '0 2px 6px rgba(29,29,25,0.08), 0 20px 44px -16px rgba(29,29,25,0.28)',
        press: '0 1px 2px rgba(29,29,25,0.12)',
      },
      borderRadius: {
        surface: '1rem', // 16px — cards, sheets, dialogs
        control: '0.75rem', // 12px — buttons, inputs, selects
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scale-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
