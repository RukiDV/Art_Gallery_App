import { Route, Routes } from "react-router";
import useSWR from "swr";

import ArtPieceList from "./components/ArtPieceList";
import { fetcher } from "./fetcher";
import "./styles.css";
import type { ArtPiece } from "./types";

const ART_PIECES_URL = "https://example-apis.vercel.app/api/art";

type GalleryPageProps = {
  artPieces: ArtPiece[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
};

function GalleryPage({ artPieces, isLoading, error }: GalleryPageProps) {
  if (error) {
    return <p>Failed to load the art pieces. Please try again later.</p>;
  }

  if (isLoading || !artPieces) {
    return <p>Loading art pieces…</p>;
  }

  return <ArtPieceList artPieces={artPieces} />;
}

export default function App() {
  const {
    data: artPieces,
    isLoading,
    error,
  } = useSWR<ArtPiece[], Error>(ART_PIECES_URL, fetcher);

  return (
    <main>
      <h1>Art Gallery</h1>
      <Routes>
        <Route
          path="/art-pieces"
          element={
            <GalleryPage
              artPieces={artPieces}
              isLoading={isLoading}
              error={error}
            />
          }
        />
      </Routes>
    </main>
  );
}
