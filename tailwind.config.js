/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html", ".//*.{js,ts,jsx,tsx}" ],**
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#050b18',
        'navy': '#0a1d37',
        'teal': '#5ba4b1',
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
