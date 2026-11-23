/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070C18',
          900: '#0B132B',
          850: '#111D3D',
          800: '#1C2541',
          700: '#2A3B66',
          600: '#3A5080',
        },
        slate: {
          850: '#151F30',
        },
        cyan: {
          450: '#00D1FF',
          500: '#00B4D8',
          600: '#0096C7',
          700: '#0077B6',
        },
        teal: {
          450: '#06D6A0',
        }
      },
    },
  },
  plugins: [],
}
