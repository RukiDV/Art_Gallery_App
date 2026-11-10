import { useId, useRef, useState } from "react";

import { type ColorFamily, getColorFamilies } from "../colorFamilies";
import { filterArtPieces, getGenres } from "../filterArtPieces";
import type { ArtPiece } from "../types";
import ArtPieceList from "./ArtPieceList";
import ColorFilter from "./ColorFilter";
import GenreFilter from "./GenreFilter";
import SearchField from "./SearchField";

type GalleryPageProps = {
  artPieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
};

export default function GalleryPage({
  artPieces,
  isFavorite,
  onToggleFavorite,
}: GalleryPageProps) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [selectedFamilies, setSelectedFamilies] = useState<ColorFamily[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const panelId = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  function toggleFamily(family: ColorFamily) {
    setSelectedFamilies((current) =>
      current.includes(family)
        ? current.filter((selected) => selected !== family)
        : [...current, family]
    );
  }

  function removeFilters() {
    setQuery("");
    setGenre("");
    setSelectedFamilies([]);
    // The button disappears, so the focus must not get lost with it.
    searchRef.current?.focus();
  }

  const shownArtPieces = filterArtPieces(
    artPieces,
    query,
    genre,
    selectedFamilies
  );

  // The search text is not counted: its field is always visible.
  const activeFilters = (genre === "" ? 0 : 1) + selectedFamilies.length;
  const hasActiveFilter = query.trim() !== "" || activeFilters > 0;

  return (
    <>
      <div className="gallery-filters">
        <SearchField value={query} onChange={setQuery} inputRef={searchRef} />
        <button
          type="button"
          aria-expanded={isPanelOpen}
          aria-controls={isPanelOpen ? panelId : undefined}
          onClick={() => setIsPanelOpen((isOpen) => !isOpen)}
        >
          {activeFilters > 0 ? `Filters (${activeFilters})` : "Filters"}
        </button>
        {hasActiveFilter && (
          <button type="button" onClick={removeFilters}>
            Remove filters
          </button>
        )}
      </div>
      {isPanelOpen && (
        <div id={panelId} className="gallery-filters">
          <GenreFilter
            genres={getGenres(artPieces)}
            value={genre}
            onChange={setGenre}
          />
          <ColorFilter
            families={getColorFamilies(artPieces)}
            selected={selectedFamilies}
            onChange={toggleFamily}
          />
        </div>
      )}
      {shownArtPieces.length === 0 ? (
        <p className="status-message">No art pieces found</p>
      ) : (
        <ArtPieceList
          artPieces={shownArtPieces}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </>
  );
}
