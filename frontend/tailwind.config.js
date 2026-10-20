/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          primary: '#173B67',
          'primary-hover': '#112B4E',
          'primary-light': '#1e4b85',
          secondary: '#2563EB',
          'secondary-hover': '#1d4ed8',
          bg: '#F7F9FC',
          card: '#FFFFFF',
          text: '#1E293B',
          muted: '#64748B',
          success: '#15803D',
          warning: '#D97706',
          error: '#DC2626',
          border: '#E2E8F0',
          accent: '#F1F5F9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'elevated': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
