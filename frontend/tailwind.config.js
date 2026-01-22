/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'coffee': {
          // Primary Palette
          'espresso': '#2D2A26',
          'dark-roast': '#4A3C31',
          'medium-roast': '#6F4E37',
          'light-roast': '#8B7355',
          'crema': '#D4B896',
          // Accent Colors
          'caramel': '#C68E17',
          'honey': '#F59E0B',
          'mint': '#10B981',
          'berry': '#EC4899',
          // Neutral Colors
          'cream': '#FAF7F2',
          'latte': '#F8F5F0',
          'milk': '#FFFFFF',
        },
        'brand': {
          primary: '#6F4E37',
          'primary-hover': '#5C4030',
          'primary-light': '#8B7355',
          secondary: '#D4B896',
          accent: '#C68E17',
          'bg-base': '#FFFFFF',
          'bg-layout': '#FAF7F2',
          'bg-card': '#FFFFFF',
          'text-primary': '#2D2A26',
          'text-secondary': '#5C5650',
          'text-muted': '#8B8580',
          'border': '#E8E2D9',
          'border-light': '#F0EBE4',
        }
      },
      fontFamily: {
        'sans': ['Sarabun', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'coffee': '0 2px 8px rgba(111, 78, 55, 0.08)',
        'coffee-md': '0 4px 16px rgba(111, 78, 55, 0.12)',
        'coffee-lg': '0 8px 32px rgba(111, 78, 55, 0.16)',
        'coffee-xl': '0 12px 48px rgba(111, 78, 55, 0.20)',
      },
      borderRadius: {
        'coffee': '12px',
        'coffee-lg': '16px',
        'coffee-xl': '20px',
      },
      backgroundImage: {
        'coffee-gradient': 'linear-gradient(135deg, #6F4E37 0%, #8B6914 100%)',
        'coffee-gradient-light': 'linear-gradient(135deg, #FAF7F2 0%, #F0EBE4 100%)',
        'coffee-gradient-warm': 'linear-gradient(135deg, #D4B896 0%, #C68E17 100%)',
      },
    },
  },
  plugins: [],
  // Important to avoid conflicts with Ant Design's base styles
  corePlugins: {
    preflight: false,
  },
};
