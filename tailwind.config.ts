import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50: '#f1f4f9', 100: '#dde4ef', 200: '#b9c6dc', 700: '#1c3256', 800: '#13243f', 900: '#0b1a30' },
        teal: { 50: '#e8f8f6', 100: '#c5eeea', 400: '#2cc4b5', 500: '#12a89a', 600: '#0d8a7e', 700: '#0b6e65' },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgba(11,26,48,.04), 0 8px 24px -12px rgba(11,26,48,.12)', lift: '0 18px 44px -14px rgba(11,26,48,.28)' },
    },
  },
  plugins: [],
};
export default config;
