/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          primary: '#8D6E63',
          'primary-focus': '#795548',
          secondary: '#A1887F',
          'bg-base': '#FFFFFF',
          'bg-layout': '#F9F6F2',
          'text-primary': '#4E342E',
          'text-secondary': '#5D4037',
        }
      },
    },
  },
  plugins: [],
  // Important to avoid conflicts with Ant Design's base styles
  corePlugins: {
    preflight: false,
  },
};
