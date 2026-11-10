import { NavLink } from "react-router";

type NavigationProps = {
  favoritesCount: number;
};

export default function Navigation({ favoritesCount }: NavigationProps) {
  return (
    <nav>
      <NavLink to="/" end>
        Spotlight
      </NavLink>
      <NavLink to="/art-pieces">Gallery</NavLink>
      <NavLink to="/favorites">
        {favoritesCount > 0 ? `Favorites (${favoritesCount})` : "Favorites"}
      </NavLink>
    </nav>
  );
}
