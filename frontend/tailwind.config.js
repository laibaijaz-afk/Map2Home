/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Construction & Wood Theme
        primary: "#D2691E",     // construction orange (burnt sienna)
        secondary: "#CD853F",  // wood brown (peru)
        accent: "#8B7355",     // earth tone (wood grain)
        wood: {
          50: "#F5E6D3",
          100: "#E8D4B8",
          200: "#D4B896",
          300: "#C19A6B",
          400: "#A0826D",
          500: "#8B7355",      // main wood
          600: "#6B5A47",
          700: "#4A3D32",
          800: "#2F251C",
          900: "#1A130E",
        },
        construction: {
          50: "#FFF4E6",
          100: "#FFE4CC",
          200: "#FFC999",
          300: "#FFA366",
          400: "#FF8C42",
          500: "#D2691E",      // construction orange
          600: "#B8541A",
          700: "#9E3F16",
          800: "#7A2F11",
          900: "#561F0C",
        },
        steel: {
          50: "#F5F7FA",
          100: "#E4E8ED",
          200: "#C9D1DB",
          300: "#A8B5C6",
          400: "#8B9DB0",
          500: "#708090",      // steel blue
          600: "#5A6B7A",
          700: "#45505C",
          800: "#2F353D",
          900: "#1A1D21",
        },
        dark: "#1A130E",       // dark wood
        light: "#F5E6D3",      // light wood/cream
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in",
        slideUp: "slideUp 0.6s ease-out",
        slideDown: "slideDown 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}
