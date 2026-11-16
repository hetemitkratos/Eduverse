/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'edu-neutral': '#f4f6f8',
        'edu-blue': '#1976d2',
        'edu-dark': '#1e293b',
        'edu-light': '#ffffff',
      }
    },
  },
  plugins: [],
}
