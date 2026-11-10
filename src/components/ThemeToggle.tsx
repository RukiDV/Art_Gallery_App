import { type MouseEvent, useEffect, useState } from "react";
import { flushSync } from "react-dom";

import { loadTheme, saveTheme, type Theme } from "../theme";

const REVEAL_DURATION_MS = 700;

function noop() {}

function MoonIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(loadTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function applyTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    saveTheme(nextTheme);
  }

  function toggleTheme(event: MouseEvent<HTMLButtonElement>) {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const prefersLessMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Without view transitions, or for people who prefer less motion, the
    // mode simply switches.
    if (!document.startViewTransition || prefersLessMotion) {
      applyTheme(nextTheme);
      return;
    }

    // The new mode grows as a circle from the click (or from the button, when
    // the click came from the keyboard).
    const { clientX, clientY } = event;
    const box = event.currentTarget.getBoundingClientRect();
    const hasMousePosition = clientX !== 0 || clientY !== 0;
    const x = hasMousePosition ? clientX : box.left + box.width / 2;
    const y = hasMousePosition ? clientY : box.top + box.height / 2;
    // The circle must reach the farthest corner of the window.
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    root.classList.add("theme-reveal");

    const transition = document.startViewTransition(() => {
      // The page must show the new mode before the browser takes the snapshot.
      root.dataset.theme = nextTheme;
      flushSync(() => applyTheme(nextTheme));
    });

    transition.ready.then(() => {
      root.animate?.(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: REVEAL_DURATION_MS,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    }, noop);

    const cleanUp = () => root.classList.remove("theme-reveal");
    transition.finished.then(cleanUp, cleanUp);
  }

  // The icon shows what a click switches to; the label says it in words.
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      onClick={toggleTheme}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
