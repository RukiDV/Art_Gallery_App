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
  onToggleFavorite: (slug: string) => void = () => {},
  pieces: ArtPiece[] = artPieces
) {
  return (
    <SpotlightPage
      artPieces={pieces}
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
    expect(screen.getAllByRole("button", { name: /^Favorite / })).toHaveLength(
      1
    );
  });

  it("reports the slug of the selected art piece when the button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    mockRandomFraction(0.99);
    render(spotlight(() => false, onToggleFavorite));

    await user.click(screen.getByRole("button", { name: /^Favorite / }));

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledWith("wheat-field-with-cypresses");
  });
});

describe("SpotlightPage: Show another", () => {
  const threePieces: ArtPiece[] = [
    ...artPieces,
    {
      slug: "the-kiss",
      artist: "Gustav Klimt",
      name: "The Kiss",
      imageSource: "https://example.com/the-kiss.jpg",
      year: "1908",
      genre: "Symbolism",
      colors: ["#C9A227"],
    },
  ];

  it("has a button named Show another when there are several pieces", () => {
    render(spotlight());

    expect(
      screen.getByRole("button", { name: "Show another" })
    ).toBeInTheDocument();
  });

  it("shows another piece with its image, artist and favorite button after a click", async () => {
    const user = userEvent.setup();
    mockRandomFraction(0);
    render(spotlight());
    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show another" }));

    expect(
      screen.getByRole("img", { name: "Wheat Field with Cypresses" })
    ).toHaveAttribute("src", artPieces[1].imageSource);
    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
    expect(
      screen.queryByText("Pieter Bruegel the Elder")
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("shows the favorite status of the new piece", async () => {
    const user = userEvent.setup();
    mockRandomFraction(0);
    render(spotlight((slug) => slug === "wheat-field-with-cypresses"));
    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: "Show another" }));

    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("never shows the same piece twice in a row", async () => {
    const user = userEvent.setup();
    const setRandomFraction = mockRandomFraction(0);
    render(spotlight(undefined, undefined, threePieces));

    for (const fraction of [0, 0.3, 0.5, 0.7, 0.999, 0, 0.5]) {
      const shown = screen.getByRole("img").getAttribute("alt");
      setRandomFraction(fraction);

      await user.click(screen.getByRole("button", { name: "Show another" }));

      expect(screen.getByRole("img").getAttribute("alt")).not.toBe(shown);
    }
  });

  it("always shows the other piece when there are exactly two", async () => {
    const user = userEvent.setup();
    const setRandomFraction = mockRandomFraction(0);
    render(spotlight());
    let expected = "Wheat Field with Cypresses";

    for (const fraction of [0, 0.999, 0.5, 0]) {
      setRandomFraction(fraction);

      await user.click(screen.getByRole("button", { name: "Show another" }));

      expect(screen.getByRole("img")).toHaveAttribute("alt", expected);
      expected =
        expected === "Wheat Field with Cypresses"
          ? "The Harvesters"
          : "Wheat Field with Cypresses";
    }
  });

  it("has no Show another button with only one piece", () => {
    render(spotlight(undefined, undefined, [artPieces[0]]));

    expect(
      screen.queryByRole("button", { name: "Show another" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toBeInTheDocument();
  });

  it("keeps the shown piece when it re-renders after Show another", async () => {
    const user = userEvent.setup();
    const setRandomFraction = mockRandomFraction(0);
    const { rerender } = render(spotlight());
    await user.click(screen.getByRole("button", { name: "Show another" }));

    setRandomFraction(0);
    rerender(spotlight((slug) => slug === "wheat-field-with-cypresses"));

    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "true");
  });
});
