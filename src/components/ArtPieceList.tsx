import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

type ArtPieceListProps = {
  artPieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
};

export default function ArtPieceList({
  artPieces,
  isFavorite,
  onToggleFavorite,
}: ArtPieceListProps) {
  return (
    <ul className="art-list">
      {artPieces.map((artPiece) => (
        <li key={artPiece.slug}>
          <ArtPiecePreview
            artPiece={artPiece}
            isFavorite={isFavorite(artPiece.slug)}
            onToggleFavorite={() => onToggleFavorite(artPiece.slug)}
          />
        </li>
      ))}
    </ul>
  );
}
