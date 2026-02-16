/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: 'rgb(245, 241, 230)',
        foreground: 'rgb(74, 63, 53)',
        card: {
          DEFAULT: 'rgb(255, 252, 245)',
          foreground: 'rgb(74, 63, 53)',
        },
        popover: {
          DEFAULT: 'rgb(255, 252, 245)',
          foreground: 'rgb(74, 63, 53)',
        },
        primary: {
          DEFAULT: 'rgb(166, 124, 82)',
          foreground: 'rgb(255, 255, 255)',
        },
        secondary: {
          DEFAULT: 'rgb(226, 216, 195)',
          foreground: 'rgb(92, 77, 63)',
        },
        muted: {
          DEFAULT: 'rgb(236, 229, 216)',
          foreground: 'rgb(125, 107, 86)',
        },
        accent: {
          DEFAULT: 'rgb(212, 200, 170)',
          foreground: 'rgb(74, 63, 53)',
        },
        destructive: {
          DEFAULT: 'rgb(181, 74, 53)',
          foreground: 'rgb(255, 255, 255)',
        },
        border: 'rgb(219, 208, 186)',
        input: 'rgb(219, 208, 186)',
        ring: 'rgb(166, 124, 82)',
        chart: {
          '1': 'rgb(166, 124, 82)',
          '2': 'rgb(141, 110, 76)',
          '3': 'rgb(115, 90, 58)',
          '4': 'rgb(179, 144, 111)',
          '5': 'rgb(192, 160, 128)',
        },
      },
      borderRadius: {
        lg: '0.25rem',
        md: '0.1875rem',
        sm: '0.125rem',
      },
      fontFamily: {
        sans: ['Cause', 'System'],
        serif: ['Lora', 'Georgia'],
        mono: ['IBM Plex Mono', 'Courier'],
      },
    },
  },
  plugins: [],
};
