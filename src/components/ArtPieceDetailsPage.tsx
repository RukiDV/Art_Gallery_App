import { Link, useParams } from "react-router";

import type { ArtPiece } from "../types";

type ArtPieceDetailsPageProps = {
  artPieces: ArtPiece[];
};

export default function ArtPieceDetailsPage({
  artPieces,
}: ArtPieceDetailsPageProps) {
  const { slug } = useParams();
  const artPiece = artPieces.find((piece) => piece.slug === slug);

  if (!artPiece) {
    return <p>Art piece not found</p>;
  }

  return (
    <article className="details">
      <Link to="/art-pieces">Back</Link>
      <img src={artPiece.imageSource} alt={artPiece.name} />
      <h2>{artPiece.name}</h2>
      <p>{artPiece.artist}</p>
      <p>{artPiece.year}</p>
      <p>{artPiece.genre}</p>
    </article>
  );
}
