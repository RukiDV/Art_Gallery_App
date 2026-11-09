import { Link } from "react-router";

import type { ArtPiece } from "../types";

type ArtPiecePreviewProps = {
  artPiece: ArtPiece;
};

export default function ArtPiecePreview({ artPiece }: ArtPiecePreviewProps) {
  return (
    <figure className="art-piece">
      <Link to={`/art-pieces/${artPiece.slug}`}>
        <img src={artPiece.imageSource} alt={artPiece.name} />
        <figcaption>
          <h2>{artPiece.name}</h2>
          <p>{artPiece.artist}</p>
        </figcaption>
      </Link>
    </figure>
  );
}
