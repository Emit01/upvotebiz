import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        apple: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        reddit: {
          DEFAULT: "#FF4500",
          hover: "#E03D00",
          light: "var(--reddit-light)",
          50: "var(--reddit-50)",
          100: "var(--reddit-100)",
          500: "#FF4500",
          600: "#E03D00",
          700: "#CC3700",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
        },
        sidebar: {
          bg: "var(--sidebar-bg)",
        },
        surface: {
          primary: "var(--surface-primary)",
          secondary: "var(--surface-secondary)",
          tertiary: "var(--surface-tertiary)",
          elevated: "var(--surface-elevated)",
          dark: "var(--surface-dark)",
          "dark-hover": "var(--surface-dark-hover)",
        },
        label: {
          primary: "var(--label-primary)",
          secondary: "var(--label-secondary)",
          tertiary: "var(--label-tertiary)",
          inverse: "var(--label-inverse)",
        },
        separator: {
          DEFAULT: "var(--separator)",
          light: "var(--separator-light)",
          dark: "var(--separator-dark)",
        },
        upvote: "#FF4500",
        downvote: "#7193FF",
      },
      borderRadius: {
        "3xl": "20px",
        "2xl": "16px",
        xl: "12px",
        lg: "10px",
      },
      boxShadow: {
        elevated: "var(--shadow-elevated)",
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
        glow: "0 0 20px rgba(255,69,0,0.15)",
        btn: "var(--shadow-btn)",
        "inner-ring": "var(--shadow-inner-ring)",
      },
      fontSize: {
        hero: ["52px", { lineHeight: "1.08", letterSpacing: "-0.025em", fontWeight: "700" }],
        "title-1": ["28px", { lineHeight: "1.14", letterSpacing: "-0.02em", fontWeight: "700" }],
        "title-2": ["22px", { lineHeight: "1.18", letterSpacing: "-0.015em", fontWeight: "700" }],
        "title-3": ["18px", { lineHeight: "1.22", letterSpacing: "-0.01em", fontWeight: "600" }],
        headline: ["16px", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-l": ["16px", { lineHeight: "1.5", letterSpacing: "-0.011em", fontWeight: "400" }],
        body: ["14px", { lineHeight: "1.5", letterSpacing: "-0.006em", fontWeight: "400" }],
        callout: ["13px", { lineHeight: "1.46", letterSpacing: "-0.003em", fontWeight: "400" }],
        subhead: ["12px", { lineHeight: "1.42", letterSpacing: "0em", fontWeight: "500" }],
        footnote: ["11px", { lineHeight: "1.36", letterSpacing: "0.01em", fontWeight: "400" }],
        caption: ["10px", { lineHeight: "1.3", letterSpacing: "0.02em", fontWeight: "500" }],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        shimmer: "shimmer 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
