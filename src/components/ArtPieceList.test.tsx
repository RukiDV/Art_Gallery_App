import { render, screen } from "@testing-library/react";

import type { ArtPiece } from "../types";
import ArtPieceList from "./ArtPieceList";

const artPieces: ArtPiece[] = [
  {
    slug: "the-harvesters",
    artist: "Pieter Bruegel the Elder",
    name: "The Harvesters",
    imageSource: "https://example.com/the-harvesters.jpg",
  },
  {
    slug: "wheat-field-with-cypresses",
    artist: "Vincent van Gogh",
    name: "Wheat Field with Cypresses",
    imageSource: "https://example.com/wheat-field.jpg",
  },
];

describe("ArtPieceList", () => {
  it("shows every art piece as an item of a list", () => {
    render(<ArtPieceList artPieces={artPieces} />);

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
    expect(screen.getByText("Wheat Field with Cypresses")).toBeInTheDocument();
  });
});
