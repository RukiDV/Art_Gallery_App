import { type DragEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import type { ArtPiece } from "../types";
import ArtPieceList from "./ArtPieceList";
import ArtPiecePreview from "./ArtPiecePreview";
import EmptyFrame from "./EmptyFrame";

type FavoritesPageProps = {
  artPieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
  // Slugs in the order in which the favorites were added.
  favoriteOrder?: string[];
  // Moves a favorite to a new place in the order (arrange mode).
  onMoveFavorite?: (slug: string, toIndex: number) => void;
};

type Direction = "earlier" | "later";

export default function FavoritesPage({
  artPieces,
  isFavorite,
  onToggleFavorite,
  favoriteOrder = [],
  onMoveFavorite,
}: FavoritesPageProps) {
  const [isArranging, setIsArranging] = useState(false);
  const [draggedSlug, setDraggedSlug] = useState<string>();
  const [dropTargetSlug, setDropTargetSlug] = useState<string>();
  const [announcement, setAnnouncement] = useState("");
  const wallRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<
    { slug: string; direction: Direction } | undefined
  >(undefined);

  // A favorite that is not in the order goes to the end, in gallery order
  // (the sort keeps the order of equal entries).
  const position = (slug: string) => {
    const index = favoriteOrder.indexOf(slug);
    return index === -1 ? favoriteOrder.length : index;
  };
  const favorites = artPieces
    .filter((artPiece) => isFavorite(artPiece.slug))
    .sort((a, b) => position(a.slug) - position(b.slug));

  // Moving a framed picture can drop the focus, so it goes back to the same
  // button afterwards (or to its partner, when that one is now disabled).
  useEffect(() => {
    const pending = pendingFocus.current;
    pendingFocus.current = undefined;
    if (!pending) {
      return;
    }

    const buttons = Array.from(
      wallRef.current?.querySelectorAll<HTMLButtonElement>(
        "button[data-move]"
      ) ?? []
    );
    const find = (direction: Direction) =>
      buttons.find(
        (button) => button.dataset.move === `${pending.slug}:${direction}`
      );
    const wanted = find(pending.direction);
    const partner = find(pending.direction === "earlier" ? "later" : "earlier");
    (wanted && !wanted.disabled ? wanted : partner)?.focus();
  });

  if (favorites.length === 0) {
    return (
      <div className="status-message">
        <EmptyFrame symbol={<HeartIcon />} />
        <p>No favorites yet</p>
        <div className="status-actions">
          <Link to="/art-pieces" className="button-link button-primary">
            Browse the gallery
          </Link>
        </div>
      </div>
    );
  }

  // Arranging needs a way to move favorites and something to move.
  const canArrange = onMoveFavorite !== undefined && favorites.length > 1;
  const isArrangeMode = isArranging && canArrange;

  function move(slug: string, toIndex: number, direction?: Direction) {
    const piece = favorites.find((artPiece) => artPiece.slug === slug);
    if (!piece || !onMoveFavorite) {
      return;
    }

    onMoveFavorite(slug, toIndex);
    setAnnouncement(
      `Moved ${piece.name} to position ${toIndex + 1} of ${favorites.length}`
    );
    if (direction) {
      pendingFocus.current = { slug, direction };
    }
  }

  function startDragging(event: DragEvent<HTMLLIElement>, slug: string) {
    setDraggedSlug(slug);
    // Firefox only starts a drag when it is given some data.
    event.dataTransfer?.setData("text/plain", slug);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  }

  function dragOver(event: DragEvent<HTMLLIElement>, slug: string) {
    if (!draggedSlug || draggedSlug === slug) {
      return;
    }
    event.preventDefault();
    setDropTargetSlug(slug);
  }

  function drop(event: DragEvent<HTMLLIElement>, index: number, slug: string) {
    event.preventDefault();
    if (draggedSlug && draggedSlug !== slug) {
      move(draggedSlug, index);
    }
    stopDragging();
  }

  function stopDragging() {
    setDraggedSlug(undefined);
    setDropTargetSlug(undefined);
  }

  return (
    <>
      {canArrange && (
        <div className="favorites-toolbar">
          <button
            type="button"
            className={isArrangeMode ? "button-primary" : undefined}
            onClick={() => setIsArranging(!isArrangeMode)}
          >
            {isArrangeMode ? "Done" : "Arrange"}
          </button>
        </div>
      )}
      <div className="favorites-wall" ref={wallRef}>
        {isArrangeMode ? (
          <>
            <p role="status" className="visually-hidden">
              {announcement}
            </p>
            <ul className="art-list arranging">
              {favorites.map((artPiece, index) => (
                <li
                  key={artPiece.slug}
                  draggable
                  className={[
                    draggedSlug === artPiece.slug && "is-dragging",
                    dropTargetSlug === artPiece.slug && "is-drop-target",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  // A click must not open the painting while arranging.
                  onClickCapture={(event) => event.preventDefault()}
                  onDragStart={(event) => startDragging(event, artPiece.slug)}
                  onDragOver={(event) => dragOver(event, artPiece.slug)}
                  onDrop={(event) => drop(event, index, artPiece.slug)}
                  onDragEnd={stopDragging}
                >
                  <ArtPiecePreview
                    artPiece={artPiece}
                    isFavorite={isFavorite(artPiece.slug)}
                    onToggleFavorite={() => onToggleFavorite(artPiece.slug)}
                  />
                  <div className="arrange-controls">
                    <button
                      type="button"
                      data-move={`${artPiece.slug}:earlier`}
                      aria-label={`Move ${artPiece.name} earlier`}
                      disabled={index === 0}
                      onClick={() => move(artPiece.slug, index - 1, "earlier")}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      data-move={`${artPiece.slug}:later`}
                      aria-label={`Move ${artPiece.name} later`}
                      disabled={index === favorites.length - 1}
                      onClick={() => move(artPiece.slug, index + 1, "later")}
                    >
                      →
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <ArtPieceList
            artPieces={favorites}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
        )}
      </div>
    </>
  );
}

function HeartIcon() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
