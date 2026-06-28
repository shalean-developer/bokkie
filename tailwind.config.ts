import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          primary: "#0a2540",
          "primary-dark": "#061828",
          "primary-light": "#1a3d5c",
          accent: "#5b9fd4",
          surface: "#f7f8fa",
        },
      },
      fontFamily: {
        script: ["var(--font-script)", "cursive"],
      },
      borderRadius: {
        button: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
