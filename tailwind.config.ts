import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/views/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/utils.ts",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        "surface": "hsl(var(--surface) / <alpha-value>)",
        "action": "hsl(var(--action) / <alpha-value>)",
        "on-action": "hsl(var(--on-action) / <alpha-value>)",
        "control": "hsl(var(--control) / <alpha-value>)",
        "low": "hsl(var(--low) / <alpha-value>)",
        "medium": "hsl(var(--medium) / <alpha-value>)",
        "high": "hsl(var(--high) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;