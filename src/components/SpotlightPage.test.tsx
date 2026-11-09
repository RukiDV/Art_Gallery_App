import { render, screen } from "@testing-library/react";

import { mockRandomFraction } from "../mockRandom";
import type { ArtPiece } from "../types";
import SpotlightPage from "./SpotlightPage";

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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SpotlightPage", () => {
  it("shows the image of the selected art piece", () => {
    mockRandomFraction(0.99);

    render(<SpotlightPage artPieces={artPieces} />);

    const image = screen.getByRole("img", {
      name: "Wheat Field with Cypresses",
    });
    expect(image).toHaveAttribute("src", artPieces[1].imageSource);
  });

  it("shows the artist of the selected art piece and no other", () => {
    mockRandomFraction(0.99);

    render(<SpotlightPage artPieces={artPieces} />);

    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
    expect(
      screen.queryByText("Pieter Bruegel the Elder")
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("keeps the same art piece when it re-renders", () => {
    const setRandomFraction = mockRandomFraction(0);
    const { rerender } = render(<SpotlightPage artPieces={artPieces} />);

    setRandomFraction(0.99);
    rerender(<SpotlightPage artPieces={artPieces} />);

    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
    expect(screen.queryByText("Vincent van Gogh")).not.toBeInTheDocument();
  });
});
