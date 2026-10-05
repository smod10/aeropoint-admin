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
          50: '#f5f1f8',
          100: '#eae3f1',
          200: '#d3c7e3',
          300: '#b49dce',
          400: '#9272b3',
          500: '#704b93',
          600: '#3d246c',
          700: '#321d59',
          800: '#271746',
          900: '#1c1033',
        },
        blue: {
          50: '#f5f1f8',
          100: '#eae3f1',
          200: '#d3c7e3',
          300: '#b49dce',
          400: '#9272b3',
          500: '#704b93',
          600: '#3d246c',
          700: '#321d59',
          800: '#271746',
          900: '#1c1033',
        },
        purple: {
          50: '#f5f1f8',
          100: '#eae3f1',
          200: '#d3c7e3',
          300: '#b49dce',
          400: '#9272b3',
          500: '#704b93',
          600: '#3d246c',
          700: '#321d59',
          800: '#271746',
          900: '#1c1033',
        },
        secondary: {
          50: '#fff1f1',
          100: '#ffe2e2',
          200: '#ffc5c5',
          300: '#ffa0a0',
          400: '#ff8080',
          500: '#ff6969',
          600: '#f45151',
          700: '#d83d3d',
          800: '#b72d2d',
          900: '#922222',
        },
        sidebar: '#3d246c',
      }
    },
  },
  plugins: [],
}