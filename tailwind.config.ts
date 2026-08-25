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
          blue: {
            DEFAULT: "#1B3A6B",
            50: "#EEF2F9",
            100: "#D6E0F0",
            200: "#ADC1E1",
            300: "#84A2D2",
            400: "#5B83C3",
            500: "#3264B4",
            600: "#2A5298",
            700: "#1B3A6B",
            800: "#132A4E",
            900: "#0B1A31",
          },
          gold: {
            DEFAULT: "#C9952A",
            50: "#FDF6E8",
            100: "#FAE9C3",
            200: "#F5D487",
            300: "#EFBF4B",
            400: "#C9952A",
            500: "#A87520",
            600: "#875816",
            700: "#663C0D",
            800: "#442004",
            900: "#220400",
          },
          cream: {
            DEFAULT: "#FDF8F0",
            50: "#FFFCF8",
            100: "#FDF8F0",
            200: "#FAF0DC",
            300: "#F5E5C0",
            400: "#EDD5A0",
          },
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
