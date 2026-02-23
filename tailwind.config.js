/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf2f4',
          100: '#fce4e9',
          200: '#f9cdd5',
          300: '#f4a3b2',
          400: '#ec6f87',
          500: '#e0435f',
          600: '#c9253f',
          700: '#a81b33',
          800: '#7e2b3f',
          900: '#5a1e2d',
          950: '#1a0a0e',
        },
        gold: {
          100: '#fdf3ec',
          200: '#f8dfc8',
          300: '#f0c4a0',
          400: '#e4a070',
          500: '#c9956b',
          600: '#b07a52',
          700: '#8a5e3c',
          800: '#6b4729',
          900: '#4a3020',
        },
        cream: '#fdf6ee',
        blush: '#f5e6e8',
        dark:  '#1a0a0e',
      },
      fontFamily: {
        display: ['"Montserrat"', 'sans-serif'],
        body:    ['"Montserrat"', 'sans-serif'],
        arabic:  ['"Noto Naskh Arabic"', 'serif'],
      },
      animation: {
        'slide-up':    'slideUp 0.4s ease-out',
        'fade-in':     'fadeIn 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-out',
        'pulse-ring':  'pulseRing 1.5s ease-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'scale(1)'    },
          '50%':      { transform: 'scale(1.05)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)',   opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
