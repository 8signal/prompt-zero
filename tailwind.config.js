/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: "#f5f2eb",
        warm: {
          50: "#faf8f4",
          100: "#edeae2",
          200: "#e5e2da",
          300: "#ddd8cc",
          400: "#c4b998",
          500: "#8a8578",
          600: "#6b6960",
          700: "#5a5a52",
          800: "#4a4a42",
          900: "#2c2c28",
        },
        danger: "#c0392b",
        success: "#6b8f5e",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        mono: ["Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};
