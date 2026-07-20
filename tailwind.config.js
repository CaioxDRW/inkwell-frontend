/** @type {import('tailwindcss').Config} */
export default {
  // ADICIONE ESTA LINHA ABAIXO:
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ecc648', // O amarelo do seu logo para usar em botões
      },
    },
  },
  plugins: [],
}