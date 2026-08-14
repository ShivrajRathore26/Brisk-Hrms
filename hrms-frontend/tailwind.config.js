/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          50: "#eaf8ff",
          100: "#d0f0ff",
          200: "#a6e4ff",
          300: "#6cd2ff",
          400: "#2ebdfd",
          500: "#02a2f3",
          600: "#0182c9",
          700: "#0367a1",
          800: "#075686",
          900: "#0b4770",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};
