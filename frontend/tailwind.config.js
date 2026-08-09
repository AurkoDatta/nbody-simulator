/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0B0E17',
        panel: '#131826',
        orbit: '#4C6EF5',
        flare: '#FF8A3D',
        phosphor: '#7CF29C',
        star: '#E8ECF7',
        dim: '#6B7488',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
