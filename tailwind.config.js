/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        input: '#BDD7EE',
        'input-dark': '#2E75B6',
      },
    },
  },
  plugins: [],
};
