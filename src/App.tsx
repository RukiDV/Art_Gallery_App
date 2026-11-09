import { type ReactNode, useState } from "react";
import { Route, Routes } from "react-router";
import useSWR from "swr";

import ArtPieceDetailsPage from "./components/ArtPieceDetailsPage";
import ArtPieceList from "./components/ArtPieceList";
import Navigation from "./components/Navigation";
import SpotlightPage from "./components/SpotlightPage";
import { fetcher } from "./fetcher";
import "./styles.css";
import type { ArtPiece, ArtPieceInfo } from "./types";

const ART_PIECES_URL = "https://example-apis.vercel.app/api/art";

export default function App() {
  const {
    data: artPieces,
    isLoading,
    error,
  } = useSWR<ArtPiece[], Error>(ART_PIECES_URL, fetcher);
  const [artPiecesInfo, setArtPiecesInfo] = useState<ArtPieceInfo[]>([]);

  function isFavorite(slug: string): boolean {
    return artPiecesInfo.some((info) => info.slug === slug && info.isFavorite);
  }

  function toggleFavorite(slug: string) {
    setArtPiecesInfo((current) => {
      if (!current.some((info) => info.slug === slug)) {
        return [...current, { slug, isFavorite: true }];
      }

      return current.map((info) =>
        info.slug === slug ? { ...info, isFavorite: !info.isFavorite } : info
      );
    });
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
