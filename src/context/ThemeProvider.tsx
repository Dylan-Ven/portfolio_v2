"use client"
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
  // Initialize to a safe default on first render (prevents server-side access to localStorage)
  const [theme, setTheme] = useState<Theme>("dark");
  // On mount, read stored preference (client-only) and apply it
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "retro") {
        setTheme(stored as Theme);
      }
    } catch (e) {
      // ignore localStorage errors (e.g., disabled in some browsers)
      // eslint-disable-next-line no-console
      console.debug('[ThemeProvider] unable to read localStorage for theme', e);
    }
  }, []);
  const [showBackgrounds, setShowBackgrounds] = useState(false);

  // Optional helper for cycling through themes (if you ever want a button toggle)
  const toggleTheme = () => {
    setTheme((prev) =>
      prev === "dark" ? "retro" : prev === "retro" ? "dark" : "dark"
    );
  };

  // Apply and persist theme
  useEffect(() => {
    // This effect runs only on the client. Still guard accesses to window/document/localStorage
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage) {
        window.localStorage.setItem("theme", theme);
      }

      // keep dataset for any consumers
      const htmlEl = document.documentElement as HTMLElement | null;
      if (htmlEl) htmlEl.dataset.theme = theme;

      // Ensure the html element has a class matching the theme so CSS variables (which use
      // the `.dark` selector) are applied correctly. Also remove other theme classes.
      if (htmlEl) {
        htmlEl.classList.remove("dark", "retro");
        if (theme === "dark") htmlEl.classList.add("dark");
        if (theme === "retro") htmlEl.classList.add("retro");
      }

      // Apply explicit background colors to several root elements to override any
      // prefixed or variable-based CSS that may be causing inverted theme colors.


      // Debugging info to help determine why themes may appear inverted
      // eslint-disable-next-line no-console
      console.debug('[ThemeProvider] set theme', theme, { htmlClasses: htmlEl ? Array.from(htmlEl.classList) : [] });
        // Debugging info to help determine why themes may appear inverted
        // eslint-disable-next-line no-console
        console.debug('[ThemeProvider] set theme', theme, { htmlClasses: htmlEl ? Array.from(htmlEl.classList) : [] });
    } catch (e) {
      // be defensive if any DOM/localStorage interactions fail
      // eslint-disable-next-line no-console
      console.debug('[ThemeProvider] unable to persist/apply theme', e);
    }
  }, [theme]);

  // Defer mounting of heavy background components until browser is idle
  useEffect(() => {
    // Guard for server environment
    if (typeof window === "undefined") return;
    // Enable backgrounds immediately on client mount to ensure visual effects appear.
    setShowBackgrounds(true);
    // Debugging: log when backgrounds are enabled
    // eslint-disable-next-line no-console
    console.debug('[ThemeProvider] showBackgrounds enabled');
    return () => {
      // nothing to clean up for the immediate enable
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[ThemeProvider] showBackgrounds changed', showBackgrounds);
  }, [showBackgrounds]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div
        className={`theme-${theme}`}
        style={{ position: "relative", height: "100vh", width: "100vw" }}
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
            <>
              {/* Development debug overlay to confirm background container sizing/visibility */}
              {process.env.NODE_ENV === 'development' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 6,
                    background: 'linear-gradient(90deg, rgba(255,0,0,0.03), rgba(0,255,0,0.03))',
                    border: '2px dashed rgba(255,255,255,0.08)',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                />
              )}

              <Suspense fallback={<></>}>
                {theme === "dark" && (
                  <>
                    {/* debug log before mounting */}
                    {console.debug && console.debug('[ThemeProvider] mounting LazyDither')}
                    <LazyDither
                      waveColor={[0.5, 0.5, 0.5]}
                      disableAnimation={false}
                      enableMouseInteraction={false}
                      colorNum={4}
                      waveAmplitude={0.3}
                      waveFrequency={4}
                      waveSpeed={0.05}
                    />
                  </>
                )}

                {theme === "retro" && (
                  <>
                    {console.debug && console.debug('[ThemeProvider] mounting LazyFaultyTerminal')}
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
                  </>
                )}
              </Suspense>
            </>
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
