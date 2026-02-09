/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFE6ED',
          100: '#FFB7CC',
          200: '#FF8AAB',
          300: '#FF5C8A',
          400: '#FF2E69',
          500: '#FF0048',
          600: '#D1003B',
          700: '#A3002E',
          800: '#750021',
          900: '#470014',
          950: '#1A0007',
        },
      },
    },
  },
  plugins: [],
};
