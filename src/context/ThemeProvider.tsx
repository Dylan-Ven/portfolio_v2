import { useState, useEffect, lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { ThemeContext } from "./ThemeContext";
import type { Theme } from "./ThemeContext";
// Background animation components (lazy-loaded to improve initial load)
const LazyDither = lazy(() => import("../components/Dither/Dither"));
const LazyFaultyTerminal = lazy(() => import("../components/Faulty_Terminal/FaultyTerminal"));
import "../styles/components/ThemeSwitcher.css";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Load initial theme from localStorage or default to dark (light removed)
  const getInitialTheme = (): Theme => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "retro") {
      return stored as Theme;
    }
    return "dark";
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [showBackgrounds, setShowBackgrounds] = useState(false);

  // Optional helper for cycling through themes (if you ever want a button toggle)
  const toggleTheme = () => {
    setTheme((prev) =>
      prev === "dark" ? "retro" : prev === "retro" ? "dark" : "dark"
    );
  };

  // Apply and persist theme
  useEffect(() => {
    localStorage.setItem("theme", theme);
    // keep dataset for any consumers
    document.documentElement.dataset.theme = theme;

    // Ensure the html element has a class matching the theme so CSS variables (which use
    // the `.dark` selector) are applied correctly. Also remove other theme classes.
    const html = document.documentElement;
  html.classList.remove("dark", "retro");
  if (theme === "dark") html.classList.add("dark");
  if (theme === "retro") html.classList.add("retro");

    // Apply explicit background colors to several root elements to override any
    // prefixed or variable-based CSS that may be causing inverted theme colors.
    const htmlEl = document.documentElement as HTMLElement;
    const body = document.body as HTMLElement;
    const app = document.querySelector('.App') as HTMLElement | null;

    const bgColor = theme === 'retro' ? '#081b08' : '#000000';
    if (htmlEl) htmlEl.style.backgroundColor = bgColor;
    if (body) body.style.backgroundColor = bgColor;
    if (app) app.style.backgroundColor = bgColor;

    // Debugging info to help determine why themes may appear inverted
    // eslint-disable-next-line no-console
    console.debug('[ThemeProvider] set theme', theme, { bgColor, htmlClasses: Array.from(htmlEl.classList) });
  }, [theme]);

  // Defer mounting of heavy background components until browser is idle
  useEffect(() => {
    let idleId: number | null = null;
    if ('requestIdleCallback' in window) {
      // @ts-ignore
      idleId = (window as any).requestIdleCallback(() => setShowBackgrounds(true));
    } else {
      // fallback
      const t = setTimeout(() => setShowBackgrounds(true), 500);
      idleId = Number(t);
    }
    return () => {
      if (idleId != null) {
        if ('cancelIdleCallback' in window) {
          // @ts-ignore
          (window as any).cancelIdleCallback(idleId);
        } else {
          clearTimeout(idleId as unknown as number);
        }
      }
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div
        className={`theme-${theme}`}
        style={{ position: "relative", minHeight: "100vh", width: "100vw" }}
      >
        {/* Background animations - behind the UI */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          {showBackgrounds && (
            <Suspense fallback={<></>}>
              {theme === "dark" && (
                <LazyDither
                  waveColor={[0.5, 0.5, 0.5]}
                  disableAnimation={false}
                  enableMouseInteraction={false}
                  colorNum={4}
                  waveAmplitude={0.3}
                  waveFrequency={3}
                  waveSpeed={0.05}
                />
              )}

              {theme === "retro" && (
                <LazyFaultyTerminal
                  scale={1.5}
                  gridMul={[2, 1]}
                  digitSize={1.2}
                  timeScale={1}
                  pause={false}
                  scanlineIntensity={1}
                  glitchAmount={1}
                  flickerAmount={1}
                  noiseAmp={1}
                  chromaticAberration={1}
                  dither={1}
                  curvature={0.3}
                  tint="#a7ef9e"
                  mouseReact={false}
                  pageLoadAnimation={false}
                  brightness={0.6}
                />
              )}
            </Suspense>
          )}
        </div>

        {/* Themed bubbly dropdown in the top-right */}
  <div className={`theme-switcher-dropdown theme-${theme}`} role="region" aria-label="Theme switcher">
          <label className="theme-switcher-label" htmlFor="theme-select">Theme</label>
          <select
            id="theme-select"
            className="theme-switcher-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
          >
            <option value="dark">Dark</option>
            <option value="retro">Retro</option>
          </select>
        </div>

        {/* Foreground app content */}
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      </div>
    </ThemeContext.Provider>
  );
}
