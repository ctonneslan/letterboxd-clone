/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'letterboxd-green': '#00e054',
        'letterboxd-orange': '#ff8000',
        'dark-bg': '#14181c',
        'dark-card': '#2c3440',
      },
    },
  },
  plugins: [],
}
