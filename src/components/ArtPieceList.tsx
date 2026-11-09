import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

type ArtPieceListProps = {
  artPieces: ArtPiece[];
};

export default function ArtPieceList({ artPieces }: ArtPieceListProps) {
  return (
    <ul className="art-list">
      {artPieces.map((artPiece) => (
        <li key={artPiece.slug}>
          <ArtPiecePreview artPiece={artPiece} />
        </li>
      ))}
    </ul>
  );
}
