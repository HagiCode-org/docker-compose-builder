/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './src/**/*.{ts,tsx}',
    './index.html',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          '"Microsoft YaHei"',
          '"Microsoft JhengHei"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"WenQuanYi Micro Hei"',
          '"Noto Sans CJK SC"',
          '"Noto Sans Variable"',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"Consolas"',
          '"Monaco"',
          '"Courier New"',
          'monospace',
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* ========== Game-ified Colors (Secondary Features Only) ========== */
        game: {
          /* Achievement rarity colors */
          rarity: {
            common: "oklch(var(--game-rarity-common))",
            rare: "oklch(var(--game-rarity-rare))",
            epic: "oklch(var(--game-rarity-epic))",
            legendary: "oklch(var(--game-rarity-legendary))",
          },
          /* Data display colors */
          success: "oklch(var(--game-success))",
          warning: "oklch(var(--game-warning))",
          info: "oklch(var(--game-info))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        /* ========== Game-ified Keyframes (Secondary Features Only) ========== */
        /* Achievement animations */
        "game-badge-flip": {
          "0%": { transform: "rotateY(-180deg) scale(0)", opacity: "0" },
          "50%": { transform: "rotateY(0deg) scale(1.1)" },
          "100%": { transform: "rotateY(0deg) scale(1)", opacity: "1" },
        },
        "game-xp-charge": {
          "0%": { backgroundPosition: "0% 50%", filter: "brightness(1)" },
          "50%": { filter: "brightness(1.2)" },
          "100%": { backgroundPosition: "100% 50%", filter: "brightness(1)" },
        },
        "game-rare-glow": {
          "0%, 100%": { boxShadow: "0 0 5px var(--game-glow-rare)" },
          "50%": { boxShadow: "0 0 15px var(--game-glow-rare)" },
        },
        "game-legendary-glow": {
          "0%, 100%": { boxShadow: "0 0 10px var(--game-glow-legendary)" },
          "50%": { boxShadow: "0 0 25px var(--game-glow-legendary), 0 0 35px var(--game-glow-legendary)" },
        },
        /* Statistics/Report animations */
        "game-number-roll": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "game-chart-enter": {
          "from": { opacity: "0", transform: "scaleX(0)" },
          "to": { opacity: "1", transform: "scaleX(1)" },
        },
        /* Micro-interactions */
        "game-button-press": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.97)" },
          "100%": { transform: "scale(1)" },
        },
        "game-save-confirm": {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "game-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        /* ========== Game-ified Animations (Secondary Features Only) ========== */
        /* Achievement animations */
        "game-badge-flip": "game-badge-flip 600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "game-xp-charge": "game-xp-charge 2s ease-in-out infinite",
        "game-rare-glow": "game-rare-glow 3s ease-in-out infinite",
        "game-legendary-glow": "game-legendary-glow 2s ease-in-out infinite",
        /* Statistics/Report animations */
        "game-number-roll": "game-number-roll 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "game-chart-enter": "game-chart-enter 400ms cubic-bezier(0.25, 0.1, 0.25, 1)",
        /* Micro-interactions */
        "game-button-press": "game-button-press 150ms ease-out",
        "game-save-confirm": "game-save-confirm 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "game-pulse": "game-pulse 2s ease-in-out infinite",
      },
      easing: {
        "game-bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "game-spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "game-smooth": "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
