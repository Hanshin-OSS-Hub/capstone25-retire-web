/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '-0.01em' }],
        'base': ['1.125rem', { lineHeight: '1.75', letterSpacing: '-0.01em' }], // 기본 18px -> 20px로 상향 조정 (노인 친화적)
        'lg': ['1.25rem', { lineHeight: '1.75', letterSpacing: '-0.01em' }],
        'xl': ['1.5rem', { lineHeight: '1.75', letterSpacing: '-0.015em' }],
        '2xl': ['1.875rem', { lineHeight: '1.6', letterSpacing: '-0.015em' }],
        '3xl': ['2.25rem', { lineHeight: '1.5', letterSpacing: '-0.02em' }],
        '4xl': ['3rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }],
        '5xl': ['3.75rem', { lineHeight: '1.3', letterSpacing: '-0.025em' }],
        '6xl': ['4.5rem', { lineHeight: '1.2', letterSpacing: '-0.025em' }],
      },
      colors: {
        'warm-teal': {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf', // Main Brand Color
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        'soft-orange': {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c', // Accent Color
          500: '#f97316',
          600: '#ea580c',
        },
        'creamy-white': '#fdfbf7', // Background Color
      },
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
