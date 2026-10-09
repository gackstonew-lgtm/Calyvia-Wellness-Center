/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#1A2F26',
          800: '#2C4A3E', // Brand Primary
          700: '#3D6656',
          600: '#4D806D',
        },
        sage: {
          500: '#6A9777',
          400: '#7BA888', // Brand Secondary
          300: '#8FB89C',
          200: '#9DC3A9',
          100: '#E2ECE5',
          50: '#F4F6F4',
        },
        terracotta: {
          700: '#8F4E36',
          600: '#A65E43',
          500: '#C17B5F', // Brand Accent (Counselling & Urgency)
          400: '#D0927B',
          100: '#FFF5F0',
        },
        sand: {
          500: '#D4C5B9',
          400: '#DDD1C6',
          300: '#E8E0D8',
          200: '#E8DCC8',
          100: '#F5EFE6',
          50: '#FDFBF7', // Brand Canvas
        },
        calyvia: {
          primary: '#2C4A3E',
          secondary: '#7BA888',
          accent: '#C17B5F',
          dark: '#3D2E28',
          muted: '#6B5D56',
          canvas: '#FDFBF7',
          card: '#FFFFFF',
          border: '#E8DCC8',
        }
      },
      fontFamily: {
        serif: ['"Crimson Pro"', 'Georgia', 'serif'],
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
};
