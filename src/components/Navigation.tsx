import { type ReactNode, useState } from "react";
import { NavLink } from "react-router";

import ThemeToggle from "./ThemeToggle";

type NavigationProps = {
  favoritesCount: number;
};

function Icon({ children }: { children: ReactNode }) {
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
      {children}
    </svg>
  );
}

export default function Navigation({ favoritesCount }: NavigationProps) {
  // The counter bumps when the number changes, not when the page opens.
  const [shownCount, setShownCount] = useState(favoritesCount);
  const [isBumping, setIsBumping] = useState(false);
  if (favoritesCount !== shownCount) {
    setShownCount(favoritesCount);
    setIsBumping(true);
  }

  return (
    <nav>
      <NavLink to="/" end>
        <Icon>
          <path d="m12 3 2.7 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17.2 6.4 20.3l1.2-6.3L3 9.6l6.3-.8z" />
        </Icon>
        <span>Spotlight</span>
      </NavLink>
      <NavLink to="/art-pieces">
        <Icon>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </Icon>
        <span>Gallery</span>
      </NavLink>
      <NavLink
        to="/favorites"
        className={isBumping ? "count-bump" : undefined}
        onAnimationEnd={() => setIsBumping(false)}
      >
        <Icon>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </Icon>
        <span>
          {favoritesCount > 0 ? `Favorites (${favoritesCount})` : "Favorites"}
        </span>
      </NavLink>
      <ThemeToggle />
    </nav>
  );
}
