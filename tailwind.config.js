/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cream': {
          50: '#FDFCFA',
          100: '#FAF9F6',
          200: '#F5F3EF',
          300: '#EDE9E2',
          400: '#E5E0D6',
          500: '#D9D2C5',
        },
        'terracotta': {
          50: '#FDF2EE',
          100: '#F9E0D8',
          200: '#F2C4B5',
          300: '#E9A08A',
          400: '#D97D5F',
          500: '#C75B3A',
          600: '#B04E30',
          700: '#964028',
          800: '#7A3521',
          900: '#5C2818',
        },
        'violet': {
          50: '#F5F0FA',
          100: '#EDE3F7',
          200: '#DBC6ED',
          300: '#C49FE0',
          400: '#A970D0',
          500: '#8F4CBF',
          600: '#7A3AA8',
          700: '#6B2C91',
          800: '#542274',
          900: '#3D1957',
        },
        'warmgray': {
          50: '#FAFAF8',
          100: '#F0EFEC',
          200: '#E2E0DA',
          300: '#D1CEC6',
          400: '#B5B0A6',
          500: '#9A9489',
          600: '#7D776D',
          700: '#5E594F',
          800: '#3D3A35',
          900: '#1F1E1C',
        },
        'power': {
          z1: '#B5B0A6',
          z2: '#7BAFD4',
          z3: '#6BBF9A',
          z4: '#D4A843',
          z5: '#D97D5F',
          z6: '#A970D0',
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Playfair Display', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
