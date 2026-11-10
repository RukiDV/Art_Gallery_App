import { type ReactNode, useEffect, useState } from "react";
import { Route, Routes } from "react-router";
import useSWR from "swr";

import ArtPieceDetailsPage from "./components/ArtPieceDetailsPage";
import ArtPieceList from "./components/ArtPieceList";
import FavoritesPage from "./components/FavoritesPage";
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
    isLoading,
    error,
  } = useSWR<ArtPiece[], Error>(ART_PIECES_URL, fetcher);
  const [artPiecesInfo, setArtPiecesInfo] =
    useState<ArtPieceInfo[]>(loadArtPiecesInfo);

  useEffect(() => {
    saveArtPiecesInfo(artPiecesInfo);
  }, [artPiecesInfo]);

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

  function withArtPieces(render: (artPieces: ArtPiece[]) => ReactNode) {
    if (error) {
      return <p>Failed to load the art pieces. Please try again later.</p>;
    }

    if (isLoading || !artPieces) {
      return <p>Loading art pieces…</p>;
    }

    return render(artPieces);
  }

  return (
    <>
      <main>
        <h1>Art Gallery</h1>
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
              <ArtPieceList
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
          <Route path="*" element={<p>Page not found</p>} />
        </Routes>
      </main>
      <Navigation />
    </>
  );
}
