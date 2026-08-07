/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#ff8a80',
          DEFAULT: '#e53935', // Zomato/Swiggy styled red
          dark: '#b71c1c',
        }
      }
    },
  },
  plugins: [],
}
