import { Link, useParams } from "react-router";

import type { ArtPiece, ArtPieceComment } from "../types";
import ColorPalette from "./ColorPalette";
import CommentForm from "./CommentForm";
import Comments from "./Comments";
import FavoriteButton from "./FavoriteButton";

type ArtPieceDetailsPageProps = {
  artPieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
  getComments: (slug: string) => ArtPieceComment[];
  onAddComment: (slug: string, text: string) => void;
  onDeleteComment: (slug: string, id: string) => void;
};

export default function ArtPieceDetailsPage({
  artPieces,
  isFavorite,
  onToggleFavorite,
  getComments,
  onAddComment,
  onDeleteComment,
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
      <FavoriteButton
        artPieceName={artPiece.name}
        isFavorite={isFavorite(artPiece.slug)}
        onToggle={() => onToggleFavorite(artPiece.slug)}
      />
      <h2>{artPiece.name}</h2>
      <p>{artPiece.artist}</p>
      <p>{artPiece.year}</p>
      <p>{artPiece.genre}</p>
      <ColorPalette colors={artPiece.colors} />
      <Comments
        comments={getComments(artPiece.slug)}
        onDeleteComment={(id) => onDeleteComment(artPiece.slug, id)}
      />
      <CommentForm onAddComment={(text) => onAddComment(artPiece.slug, text)} />
    </article>
  );
}
