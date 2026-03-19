import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        set({ theme });
      },
      toggle: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        set({ theme: next });
      },
    }),
    { name: "valo-theme" }
  )
);

export function initTheme() {
  const stored = localStorage.getItem("valo-theme");
  let theme: Theme = "dark";
  if (stored) {
    try {
      theme = (JSON.parse(stored) as { state: { theme: Theme } }).state.theme;
    } catch {
      localStorage.removeItem("valo-theme");
    }
  }
  document.documentElement.setAttribute("data-theme", theme);
}
