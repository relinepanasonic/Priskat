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
          bg: "#10232A",
          surface: {
            DEFAULT: "#3D4D55",
            hover: "#4b5d66",
          },
          border: "#293840",
          gold: {
            DEFAULT: "#B58863",
            hover: "#9c7554",
          },
          light: "#D3C3B9",
          muted: "#A79E9C",
          dark: "#181818",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
