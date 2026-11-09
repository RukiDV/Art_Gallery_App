import { useState } from "react";

import { getRandomArtPiece } from "../randomArtPiece";
import type { ArtPiece } from "../types";

type SpotlightPageProps = {
  artPieces: ArtPiece[];
};

export default function SpotlightPage({ artPieces }: SpotlightPageProps) {
  const [artPiece] = useState(() => getRandomArtPiece(artPieces));

  return (
    <figure className="art-piece spotlight">
      <img src={artPiece.imageSource} alt={artPiece.name} />
      <figcaption>
        <p>{artPiece.artist}</p>
      </figcaption>
    </figure>
  );
}
