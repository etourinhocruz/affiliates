/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          100: '#E6FFE0',
          200: '#B6FFA1',
          300: '#7CFF58',
          400: '#39FF14',
          500: '#1FE600',
          600: '#17B800',
          700: '#0F8A00',
        },
      },
      boxShadow: {
        neon: '0 0 24px rgba(57,255,20,0.45)',
        'neon-sm': '0 0 12px rgba(57,255,20,0.6)',
      },
    },
  },
  plugins: [],
};
