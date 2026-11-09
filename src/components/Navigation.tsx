import { NavLink } from "react-router";

export default function Navigation() {
  return (
    <nav>
      <NavLink to="/" end>
        Spotlight
      </NavLink>
      <NavLink to="/art-pieces">Gallery</NavLink>
      <NavLink to="/favorites">Favorites</NavLink>
    </nav>
  );
}
