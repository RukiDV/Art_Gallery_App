import { Route, Routes } from "react-router";
import useSWR from "swr";

import ArtPieceList from "./components/ArtPieceList";
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

  let content;

  if (error) {
    content = <p>Failed to load the art pieces. Please try again later.</p>;
  } else if (isLoading || !artPieces) {
    content = <p>Loading art pieces…</p>;
  } else {
    content = (
      <Routes>
        <Route path="/" element={<SpotlightPage artPieces={artPieces} />} />
        <Route
          path="/art-pieces"
          element={<ArtPieceList artPieces={artPieces} />}
        />
      </Routes>
    );
  }

  return (
    <main>
      <h1>Art Gallery</h1>
      {content}
    </main>
  );
}
