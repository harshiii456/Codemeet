/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          750: '#334155',
          850: '#1a202c',
          950: '#0f172a',
        },
      },
    },
  },
  plugins: [],
}

