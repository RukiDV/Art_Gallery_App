import { type CSSProperties, useState, ViewTransition } from "react";
import { Link, useParams } from "react-router";

import type { ArtPiece, ArtPieceComment } from "../types";
import ColorPalette from "./ColorPalette";
import CommentForm from "./CommentForm";
import Comments from "./Comments";
import EmptyFrame from "./EmptyFrame";
import FavoriteButton from "./FavoriteButton";
import Lightbox from "./Lightbox";
import TransitionLink, { OPEN_DETAILS_TRANSITION } from "./TransitionLink";

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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const artPiece = artPieces.find((piece) => piece.slug === slug);

  if (!artPiece) {
    return (
      <div className="status-message">
        <EmptyFrame symbol="?" />
        <p>Art piece not found</p>
        <div className="status-actions">
          <Link to="/art-pieces" className="button-link button-primary">
            Back to the gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article
      className="details"
      // The first palette color tints the glow (see styles.css).
      style={
        { "--art-glow": artPiece.colors[0] ?? "transparent" } as CSSProperties
      }
    >
      <TransitionLink to="/art-pieces">Back</TransitionLink>
      <div className="details-card">
        <div className="details-media">
          <button
            type="button"
            className="details-zoom"
            aria-label={`Enlarge ${artPiece.name}`}
            onClick={() => setIsLightboxOpen(true)}
          >
            <ViewTransition
              name={`art-picture-${artPiece.slug}`}
              default="none"
              share={{ [OPEN_DETAILS_TRANSITION]: "auto", default: "none" }}
            >
              <img src={artPiece.imageSource} alt={artPiece.name} />
            </ViewTransition>
            <span className="zoom-chip" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5M11 8v6M8 11h6" />
              </svg>
            </span>
          </button>
          <FavoriteButton
            artPieceName={artPiece.name}
            isFavorite={isFavorite(artPiece.slug)}
            onToggle={() => onToggleFavorite(artPiece.slug)}
          />
        </div>
        <div className="details-info">
          <h2>{artPiece.name}</h2>
          <p className="details-artist">{artPiece.artist}</p>
          <p className="details-year">{artPiece.year}</p>
          <p className="details-genre">{artPiece.genre}</p>
          <ColorPalette colors={artPiece.colors} />
        </div>
      </div>
      {isLightboxOpen && (
        <Lightbox
          imageSource={artPiece.imageSource}
          name={artPiece.name}
          artist={artPiece.artist}
          glow={artPiece.colors[0] ?? "transparent"}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
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
