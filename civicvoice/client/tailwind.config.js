/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        civic: {
          50:  '#fdf8ee', 100: '#faefd4', 200: '#f4d99a', 300: '#eebe5f',
          400: '#e8a030', 500: '#e8820c', 600: '#cf6a09', 700: '#a8520b',
          800: '#884110', 900: '#6f3710',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
