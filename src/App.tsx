import type { ReactNode } from "react";
import { Route, Routes } from "react-router";
import useSWR from "swr";

import ArtPieceList from "./components/ArtPieceList";
import Navigation from "./components/Navigation";
import SpotlightPage from "./components/SpotlightPage";
import { fetcher } from "./fetcher";
import "./styles.css";
import type { ArtPiece } from "./types";

const ART_PIECES_URL = "https://example-apis.vercel.app/api/art";

export default function App() {
  const {
    data: artPieces,
    isLoading,
    error,
  } = useSWR<ArtPiece[], Error>(ART_PIECES_URL, fetcher);

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
              <SpotlightPage artPieces={loaded} />
            ))}
          />
          <Route
            path="/art-pieces"
            element={withArtPieces((loaded) => (
              <ArtPieceList artPieces={loaded} />
            ))}
          />
          <Route path="*" element={<p>Page not found</p>} />
        </Routes>
      </main>
      <Navigation />
    </>
  );
}
