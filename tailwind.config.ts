import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#090A0F",
          900: "#0F1219",
          850: "#141822",
          800: "#1A202E",
          700: "#273042",
          600: "#374156",
          500: "#4B556D",
        },
        brand: {
          purple: {
            DEFAULT: "#8B5CF6",
            muted: "#7C3AED",
            soft: "#A78BFA",
            dark: "#2E1065",
            glow: "rgba(139, 92, 246, 0.12)",
          },
          green: {
            DEFAULT: "#10B981",
            muted: "#059669",
            soft: "#34D399",
            dark: "#064E3B",
            glow: "rgba(16, 185, 129, 0.12)",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        glowPurple: "0 0 25px -5px rgba(139, 92, 246, 0.2)",
        glowGreen: "0 0 25px -5px rgba(16, 185, 129, 0.2)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;

