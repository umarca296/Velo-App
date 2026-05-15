/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#f5f0ff',
          100: '#ede5ff',
          200: '#d6c6ff',
          300: '#b89aff',
          400: '#9a6dff',
          500: '#7c40ff',
          600: '#6B2C91',
          700: '#5a247a',
          800: '#491c63',
          900: '#38154d',
        },
        'accent': {
          50: '#fff5f0',
          100: '#ffe8db',
          200: '#ffd0b8',
          300: '#ffb08a',
          400: '#ff8f5c',
          500: '#E8774B',
          600: '#d4683f',
          700: '#b85a36',
          800: '#9c4c2d',
          900: '#803e25',
        },
        'power': {
          z1: '#94a3b8',
          z2: '#60a5fa',
          z3: '#34d399',
          z4: '#fbbf24',
          z5: '#f87171',
          z6: '#a78bfa',
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
