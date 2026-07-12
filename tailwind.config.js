/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
        sidebar: '#0f172a', // Clean, dark sidebar contrasting with white cards
      },
      boxShadow: {
        'soft': '0 2px 10px -3px rgba(6, 81, 237, 0.1)',
      }
    },
  },
  plugins: [],
}