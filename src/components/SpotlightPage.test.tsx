import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockRandomFraction } from "../mockRandom";
import type { ArtPiece } from "../types";
import SpotlightPage from "./SpotlightPage";

const artPieces: ArtPiece[] = [
  {
    slug: "the-harvesters",
    artist: "Pieter Bruegel the Elder",
    name: "The Harvesters",
    imageSource: "https://example.com/the-harvesters.jpg",
    year: "1565",
    genre: "Renaissance",
    colors: ["#37412E", "#8D7332"],
  },
  {
    slug: "wheat-field-with-cypresses",
    artist: "Vincent van Gogh",
    name: "Wheat Field with Cypresses",
    imageSource: "https://example.com/wheat-field.jpg",
    year: "1889",
    genre: "Landscape Painting",
    colors: ["#718F98", "#9DA59E"],
  },
];

afterEach(() => {
  vi.restoreAllMocks();
});

function spotlight(
  isFavorite: (slug: string) => boolean = () => false,
  onToggleFavorite: (slug: string) => void = () => {}
) {
  return (
    <SpotlightPage
      artPieces={artPieces}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
    />
  );
}

describe("SpotlightPage", () => {
  it("shows the image of the selected art piece", () => {
    mockRandomFraction(0.99);

    render(spotlight());

    const image = screen.getByRole("img", {
      name: "Wheat Field with Cypresses",
    });
    expect(image).toHaveAttribute("src", artPieces[1].imageSource);
  });

  it("shows the artist of the selected art piece and no other", () => {
    mockRandomFraction(0.99);

    render(spotlight());

    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
    expect(
      screen.queryByText("Pieter Bruegel the Elder")
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("keeps the same art piece when it re-renders", () => {
    const setRandomFraction = mockRandomFraction(0);
    const { rerender } = render(spotlight());

    setRandomFraction(0.99);
    rerender(spotlight());

    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
    expect(screen.queryByText("Vincent van Gogh")).not.toBeInTheDocument();
  });

  it("shows a favorite button for the selected art piece", () => {
    mockRandomFraction(0.99);

    render(spotlight((slug) => slug === "wheat-field-with-cypresses"));

    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("reports the slug of the selected art piece when the button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    mockRandomFraction(0.99);
    render(spotlight(() => false, onToggleFavorite));

    await user.click(screen.getByRole("button"));

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledWith("wheat-field-with-cypresses");
  });
});
