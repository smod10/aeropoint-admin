/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 2. Add the fontFamily override here
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      },
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0edff',
          200: '#cce0ff',
          300: '#a3c8ff',
          400: '#70a5ff',
          500: '#3d7aff',
          600: '#0d6efd', // Your core brand blue
          700: '#0054d6',
          800: '#0043ab',
          900: '#00368a',
        },
        sidebar: '#0f172a', // Slate 900
      }
    },
  },
  plugins: [],
}