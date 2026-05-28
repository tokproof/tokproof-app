import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tokproof brand — mirrors CSS vars for Tailwind utilities
        pink:    '#FF2D75',
        purple:  '#7C3AED',
        spink:   '#FF8AB3',
        spurple: '#A855F7',
        bg:      '#0F0F10',
        bg2:     '#15151B',
        card:    '#1D1D26',
        card2:   '#242430',
        border:  '#2D2D38',
      },
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
