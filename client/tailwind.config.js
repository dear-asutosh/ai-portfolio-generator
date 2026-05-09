/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#ffffff",
        muted: "#94a3b8",
        indigo: {
          500: "#6366f1",
        },
        purple: {
          500: "#8b5cf6",
        },
        cyan: {
          500: "#06b6d4",
        },
        card: "#0f1322",
        dark: "#080c18"
      },
      fontFamily: {
        sans: ['Zilla Slab', 'serif'],
        heading: ['Lexend', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.08)',
        hover: 'rgba(99,102,241,0.5)',
      }
    },
  },
  plugins: [],
}
