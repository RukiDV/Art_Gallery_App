import { render, screen } from "@testing-library/react";

import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

const artPiece: ArtPiece = {
  slug: "the-harvesters",
  artist: "Pieter Bruegel the Elder",
  name: "The Harvesters",
  imageSource: "https://example.com/the-harvesters.jpg",
};

describe("ArtPiecePreview", () => {
  it("shows the image of the art piece", () => {
    render(<ArtPiecePreview artPiece={artPiece} />);

    const image = screen.getByRole("img", { name: "The Harvesters" });
    expect(image).toHaveAttribute("src", artPiece.imageSource);
  });

  it("shows the title", () => {
    render(<ArtPiecePreview artPiece={artPiece} />);

    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
  });

  it("shows the name of the artist", () => {
    render(<ArtPiecePreview artPiece={artPiece} />);

    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
  });
});
