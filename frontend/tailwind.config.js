/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          bg: "#F7FAFC",
          card: "#FFFFFF",
          text: "#1F2937",
          primary: "#7C9AFF",
          "primary-dark": "#5677F3",
          accent: "#FBB6CE",
          "pastel-orange": "#FFDAB9",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
