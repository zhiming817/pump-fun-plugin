/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pledged: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        notPledged: {
          light: '#fed7aa',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
      },
    },
  },
  plugins: [],
  // Important: Add prefix to avoid conflicts with pump.fun styles
  important: true,
}

