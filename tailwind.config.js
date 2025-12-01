/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#019863',
        'background-light': '#f5f8f7',
        'background-dark': '#0f231c',
        'content-light': '#101816',
        'content-dark': '#e0e4e3',
        'subtle-light': '#5e8d7c',
        'subtle-dark': '#8aaea3',
        'border-light': '#e0e4e3',
        'border-dark': '#2a3c36',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px'
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}

