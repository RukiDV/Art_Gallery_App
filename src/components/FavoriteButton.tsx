import { useState } from "react";

type FavoriteButtonProps = {
  artPieceName: string;
  isFavorite: boolean;
  onToggle: () => void;
};

export default function FavoriteButton({
  artPieceName,
  isFavorite,
  onToggle,
}: FavoriteButtonProps) {
  // Only marking a favorite pops; a page that opens with favorites stays calm.
  const [isPopping, setIsPopping] = useState(false);

  return (
    <button
      type="button"
      className={isPopping ? "favorite-button favorite-pop" : "favorite-button"}
      aria-pressed={isFavorite}
      aria-label={`Favorite ${artPieceName}`}
      onClick={() => {
        setIsPopping(!isFavorite);
        onToggle();
      }}
      onAnimationEnd={() => setIsPopping(false)}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}
