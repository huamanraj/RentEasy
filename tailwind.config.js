/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: "#FF5A5F", // Airbnb red
        textDark: "#222222", // Black for headings
        textLight: "#484848", // Dark gray for body text
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}