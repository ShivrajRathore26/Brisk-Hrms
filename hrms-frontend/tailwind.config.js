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
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.04)",
        "card-hover": "0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06)",
        popover: "0 12px 32px -8px rgb(15 23 42 / 0.16), 0 4px 8px -4px rgb(15 23 42 / 0.08)",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "scale-in": { from: { opacity: 0, transform: "scale(0.97) translateY(4px)" }, to: { opacity: 1, transform: "scale(1) translateY(0)" } },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
        "scale-in": "scale-in 0.15s ease-out",
      },
    },
  },
  plugins: [],
};
