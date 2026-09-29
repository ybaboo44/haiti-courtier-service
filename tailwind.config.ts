import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: {
    brand: { DEFAULT: "#0E5FA8", dark: "#0A4679", light: "#E8F1FA" },
    accent: "#E8A020"
  } } },
  plugins: [],
} satisfies Config;
