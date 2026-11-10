import { type ReactNode, useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router";
import useSWR from "swr";

import ArtPieceDetailsPage from "./components/ArtPieceDetailsPage";
import EmptyFrame from "./components/EmptyFrame";
import FavoritesPage from "./components/FavoritesPage";
import GalleryPage from "./components/GalleryPage";
import Navigation from "./components/Navigation";
import SpotlightPage from "./components/SpotlightPage";
import { fetcher } from "./fetcher";
import { loadArtPiecesInfo, saveArtPiecesInfo } from "./storage";
import "./styles.css";
import type { ArtPiece, ArtPieceComment, ArtPieceInfo } from "./types";

const ART_PIECES_URL = "https://example-apis.vercel.app/api/art";

export default function App() {
  const {
    data: artPieces,
    isValidating,
    error,
    mutate,
  } = useSWR<ArtPiece[], Error>(ART_PIECES_URL, fetcher, {
    // The Try again button replaces SWR's silent automatic retries.
    shouldRetryOnError: false,
  });
  const [artPiecesInfo, setArtPiecesInfo] =
    useState<ArtPieceInfo[]>(loadArtPiecesInfo);

  useEffect(() => {
    saveArtPiecesInfo(artPiecesInfo);
  }, [artPiecesInfo]);

  const favoritesCount = artPiecesInfo.filter((info) => info.isFavorite).length;

  function isFavorite(slug: string): boolean {
    return artPiecesInfo.some((info) => info.slug === slug && info.isFavorite);
  }

  function getComments(slug: string): ArtPieceComment[] {
    return artPiecesInfo.find((info) => info.slug === slug)?.comments ?? [];
  }

  function updateInfo(
    slug: string,
    update: (info: ArtPieceInfo) => ArtPieceInfo
  ) {
    setArtPiecesInfo((current) => {
      if (!current.some((info) => info.slug === slug)) {
        return [...current, update({ slug, isFavorite: false, comments: [] })];
      }

      return current.map((info) => (info.slug === slug ? update(info) : info));
    });
  }

  function toggleFavorite(slug: string) {
    updateInfo(slug, (info) => ({ ...info, isFavorite: !info.isFavorite }));
  }

  function addComment(slug: string, text: string) {
    const comment: ArtPieceComment = {
      id: crypto.randomUUID(),
      text,
      date: new Date().toISOString(),
    };

    updateInfo(slug, (info) => ({
      ...info,
      comments: [...info.comments, comment],
    }));
  }

  function deleteComment(slug: string, commentId: string) {
    updateInfo(slug, (info) => ({
      ...info,
      comments: info.comments.filter((comment) => comment.id !== commentId),
    }));
  }

  function editComment(slug: string, commentId: string, text: string) {
    const replacedAt = new Date().toISOString();

    updateInfo(slug, (info) => ({
      ...info,
      comments: info.comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              text,
              edited: true,
              history: [
                ...(comment.history ?? []),
                { text: comment.text, replacedAt },
              ],
            }
          : comment
      ),
    }));
  }

  function withArtPieces(render: (artPieces: ArtPiece[]) => ReactNode) {
    // SWR keeps the old error while it loads again, so a retry without data
    // must not show the error.
    const isLoadingWithoutData = isValidating && !artPieces;

    if (error && !isLoadingWithoutData) {
      return (
        <div className="status-message">
          <EmptyFrame symbol="!" />
          <p>Failed to load the art pieces. Please try again later.</p>
          <button type="button" onClick={() => mutate()}>
            Try again
          </button>
        </div>
      );
    }

    if (!artPieces) {
      return (
        <div className="status-message">
          <EmptyFrame isLoading />
          <p>Loading art pieces…</p>
        </div>
      );
    }

    return render(artPieces);
  }

  return (
    <>
      <header className="site-header">
        <h1>Art Gallery</h1>
      </header>
      <main>
        <Routes>
          <Route
            path="/"
            element={withArtPieces((loaded) => (
              <SpotlightPage
                artPieces={loaded}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          />
          <Route
            path="/art-pieces"
            element={withArtPieces((loaded) => (
              <GalleryPage
                artPieces={loaded}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          />
          <Route
            path="/art-pieces/:slug"
            element={withArtPieces((loaded) => (
              <ArtPieceDetailsPage
                artPieces={loaded}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
                getComments={getComments}
                onAddComment={addComment}
                onDeleteComment={deleteComment}
                onEditComment={editComment}
              />
            ))}
          />
          <Route
            path="/favorites"
            element={withArtPieces((loaded) => (
              <FavoritesPage
                artPieces={loaded}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          />
          <Route
            path="*"
            element={
              <div className="status-message">
                <EmptyFrame symbol="?" />
                <p>Page not found</p>
                <div className="status-actions">
                  <Link to="/" className="button-link button-primary">
                    Back to the Spotlight
                  </Link>
                  <Link to="/art-pieces" className="button-link">
                    Browse the gallery
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
      <Navigation favoritesCount={favoritesCount} />
    </>
  );
}
