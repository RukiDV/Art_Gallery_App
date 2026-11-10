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
  onEditComment: (slug: string, id: string, text: string) => void;
};

export default function ArtPieceDetailsPage({
  artPieces,
  isFavorite,
  onToggleFavorite,
  getComments,
  onAddComment,
  onDeleteComment,
  onEditComment,
}: ArtPieceDetailsPageProps) {
  const { slug } = useParams();
  const artPiece = artPieces.find((piece) => piece.slug === slug);

  if (!artPiece) {
    return <p className="status-message">Art piece not found</p>;
  }

  return (
    <article className="details">
      <Link to="/art-pieces">Back</Link>
      <div className="details-media">
        <img src={artPiece.imageSource} alt={artPiece.name} />
        <FavoriteButton
          artPieceName={artPiece.name}
          isFavorite={isFavorite(artPiece.slug)}
          onToggle={() => onToggleFavorite(artPiece.slug)}
        />
      </div>
      <div className="details-info">
        <h2>{artPiece.name}</h2>
        <p className="details-artist">{artPiece.artist}</p>
        <p className="details-meta">{artPiece.year}</p>
        <p className="details-meta">{artPiece.genre}</p>
        <ColorPalette colors={artPiece.colors} />
      </div>
      <div className="details-comments">
        <Comments
          comments={getComments(artPiece.slug)}
          onDeleteComment={(id) => onDeleteComment(artPiece.slug, id)}
          onEditComment={(id, text) => onEditComment(artPiece.slug, id, text)}
        />
        <CommentForm
          onAddComment={(text) => onAddComment(artPiece.slug, text)}
        />
      </div>
    </article>
  );
}
