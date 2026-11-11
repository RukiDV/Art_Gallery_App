import { type CSSProperties, useEffect, useState, ViewTransition } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { debugFlag } from "../debugFlags";
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
  const navigate = useNavigate();
  const index = artPieces.findIndex((piece) => piece.slug === slug);
  const artPiece = artPieces[index];

  // The neighbours in the order of the gallery; the ends wrap around.
  const canBrowse = index !== -1 && artPieces.length > 1;
  const previous = canBrowse
    ? artPieces[(index - 1 + artPieces.length) % artPieces.length]
    : undefined;
  const next = canBrowse
    ? artPieces[(index + 1) % artPieces.length]
    : undefined;

  useEffect(() => {
    if (!previous || !next || isLightboxOpen) {
      return;
    }

    function browseWithArrowKeys(event: KeyboardEvent) {
      const hasModifier =
        event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
      if (event.defaultPrevented || hasModifier || isTyping(event.target)) {
        return;
      }
      if (event.key === "ArrowLeft") {
        void navigate(`/art-pieces/${previous?.slug}`);
      } else if (event.key === "ArrowRight") {
        void navigate(`/art-pieces/${next?.slug}`);
      }
    }

    document.addEventListener("keydown", browseWithArrowKeys);
    return () => document.removeEventListener("keydown", browseWithArrowKeys);
  }, [previous, next, isLightboxOpen, navigate]);

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
      <div className="details-top">
        {debugFlag("plainBack") ? (
          <Link to="/art-pieces">Back</Link>
        ) : (
          <TransitionLink to="/art-pieces">Back</TransitionLink>
        )}
        {previous && next && (
          <div
            className="details-browse"
            role="group"
            aria-label="Browse paintings"
          >
            <Link
              to={`/art-pieces/${previous.slug}`}
              className="button-link"
              title={`Previous: ${previous.name}`}
            >
              <span aria-hidden="true">←</span>
              <span className="browse-label">Previous: {previous.name}</span>
            </Link>
            <Link
              to={`/art-pieces/${next.slug}`}
              className="button-link"
              title={`Next: ${next.name}`}
            >
              <span className="browse-label">Next: {next.name}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </div>
      <div className="details-card">
        <div className="details-media">
          <button
            type="button"
            className="details-zoom"
            aria-label={`Enlarge ${artPiece.name}`}
            onClick={() => setIsLightboxOpen(true)}
          >
            {debugFlag("noVT") ? (
              <img src={artPiece.imageSource} alt={artPiece.name} />
            ) : (
              <ViewTransition
                name={`art-picture-${artPiece.slug}`}
                default="none"
                share={{ [OPEN_DETAILS_TRANSITION]: "auto", default: "none" }}
              >
                <img src={artPiece.imageSource} alt={artPiece.name} />
              </ViewTransition>
            )}
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
      <div className="details-comments" key={artPiece.slug}>
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

// Arrow keys belong to the field while someone is typing in it.
function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}
