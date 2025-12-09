import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hubfi Brand Colors - Direct usage (optional)
        brand: {
          // Light Mode
          white: "#FFFFFF",
          gray: "#B7B7B7",
          charcoal: "#5E5E5E",
          black: "#181818",
          // Dark Mode
          dark: {
            bg: "#0A0A0A",
            card: "#1A1A1A",
            border: "#2A2A2A",
            muted: "#8A8A8A",
            text: "#E5E5E5",
          },
        },
        // Semantic colors using CSS variables (shadcn/ui compatible)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        serif: ["var(--font-stix-two)", "ui-serif", "Georgia", "serif"],
        sans: [
          "var(--font-acumin-pro)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        // Hubfi Typography Scale
        display: ["3.5rem", { lineHeight: "1", fontWeight: "500" }],
        headline: ["2.25rem", { lineHeight: "1", fontWeight: "500" }],
        title: ["1.5rem", { lineHeight: "1.1", fontWeight: "500" }],
        body: ["1rem", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["0.875rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
