import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#272A30",
          surface: {
            DEFAULT: "#394F6B",
            hover: "#455E7C",
            beige: "#C6B9A3",
          },
          border: "#1C1E23",
          gold: {
            DEFAULT: "#D6B072",
            hover: "#FFD770",
          },
          blue: {
            DEFAULT: "#394F6B",
            glow: "#5BA4FF",
          },
          light: "#EAE5D9",
          muted: "#9CA3AF",
          dark: "#121417",
        },
      },
      boxShadow: {
        '3d': '0 8px 16px -4px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
        '3d-sm': '0 4px 8px -2px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
        '3d-pressed': 'inset 0 4px 8px rgba(0, 0, 0, 0.6)',
        '3d-inset': 'inset 0 2px 6px rgba(0, 0, 0, 0.7)',
        'glow-blue': '0 0 15px rgba(91, 164, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
        'glow-gold': '0 0 15px rgba(255, 215, 112, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
