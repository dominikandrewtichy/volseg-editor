import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;

    function getSystemTheme() {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    function applyTheme() {
      root.classList.remove("light", "dark");

      if (theme === "system") {
        const systemTheme = getSystemTheme();
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    }

    function loadMolstarTheme() {
      const existingLink = document.getElementById("molstar-theme");
      if (existingLink) existingLink.remove();

      const link = document.createElement("link");
      link.id = "molstar-theme";
      link.rel = "stylesheet";
      if (theme === "system") {
        const systemTheme = getSystemTheme();
        link.href = `/styles/molstar-${systemTheme}-theme.css`;
      } else {
        link.href = `/styles/molstar-${theme}-theme.css`;
      }
      document.head.appendChild(link);
    }

    applyTheme();
    loadMolstarTheme();

    // Add event listener for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme();

        const systemTheme = getSystemTheme();
        const event = new CustomEvent("theme-change", {
          detail: { theme: systemTheme },
        });
        window.dispatchEvent(event);
      }
    };

    // Modern way to add the listener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);

      const event = new CustomEvent("theme-change", {
        detail: { theme },
      });
      window.dispatchEvent(event);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
