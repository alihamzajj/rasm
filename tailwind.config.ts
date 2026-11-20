import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1240px" } },
    extend: {
      colors: {
        maroon: { DEFAULT: "#5B1A2B", dark: "#3A0F1B", light: "#7A2A3E" },
        gold: { DEFAULT: "#B8862F", text: "#8A6420", soft: "#E9C77B" },
        ivory: "#FBF6EE",
        cream: "#F3EADB",
        line: "#E6D5B8",
        ink: { DEFAULT: "#2B1A1F", muted: "#5C4A4F" },
        // shadcn tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-mulish)", "system-ui", "sans-serif"],
      },
      borderRadius: { lg: "6px", md: "5px", sm: "4px" },
      keyframes: {
        glow: {
          "0%,100%": { opacity: "0.55", transform: "scale(0.95)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        flicker: {
          "0%,100%": { transform: "scaleY(1) rotate(-2deg)" },
          "50%": { transform: "scaleY(1.12) rotate(2deg)" },
        },
      },
      animation: {
        glow: "glow 3.2s ease-in-out infinite",
        flicker: "flicker 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
};
export default config;
