import { filterArtPieces, getGenres } from "./filterArtPieces";
import type { ArtPiece } from "./types";

function piece(
  overrides: Partial<ArtPiece> & Pick<ArtPiece, "slug">
): ArtPiece {
  return {
    artist: "Unknown Artist",
    name: "Untitled",
    imageSource: "https://example.com/image.jpg",
    year: "1900",
    genre: "Other",
    colors: [],
    ...overrides,
  };
}

const harvesters = piece({
  slug: "the-harvesters",
  name: "The Harvesters",
  artist: "Pieter Bruegel the Elder",
  genre: "Renaissance",
});
const wheatField = piece({
  slug: "wheat-field",
  name: "Wheat Field with Cypresses",
  artist: "Vincent van Gogh",
  genre: "Landscape Painting",
});
const starryNight = piece({
  slug: "starry-night",
  name: "The Starry Night",
  artist: "Vincent van Gogh",
  genre: "Landscape Painting",
});
const artPieces = [harvesters, wheatField, starryNight];

describe("filterArtPieces", () => {
  it("keeps every art piece for an empty search and no genre", () => {
    expect(filterArtPieces(artPieces, "", "")).toEqual(artPieces);
  });

  it("finds art pieces by a part of their title", () => {
    expect(filterArtPieces(artPieces, "harvest", "")).toEqual([harvesters]);
  });

  it("finds art pieces by a part of the artist's name", () => {
    expect(filterArtPieces(artPieces, "gogh", "")).toEqual([
      wheatField,
      starryNight,
    ]);
  });

  it("ignores upper and lower case", () => {
    expect(filterArtPieces(artPieces, "WHEAT field", "")).toEqual([wheatField]);
    expect(filterArtPieces(artPieces, "pieter BRUEGEL", "")).toEqual([
      harvesters,
    ]);
  });

  it("ignores spaces at the start and the end of the search text", () => {
    expect(filterArtPieces(artPieces, "   starry   ", "")).toEqual([
      starryNight,
    ]);
  });

  it("treats a search text with only spaces like an empty one", () => {
    expect(filterArtPieces(artPieces, "     ", "")).toEqual(artPieces);
  });

  it("does not search in the genre", () => {
    expect(filterArtPieces(artPieces, "renaissance", "")).toEqual([]);
  });

  it("keeps only the art pieces of the selected genre", () => {
    expect(filterArtPieces(artPieces, "", "Landscape Painting")).toEqual([
      wheatField,
      starryNight,
    ]);
  });

  it("needs a piece to match the search and the genre", () => {
    expect(filterArtPieces(artPieces, "the", "Landscape Painting")).toEqual([
      starryNight,
    ]);
    expect(filterArtPieces(artPieces, "the", "Renaissance")).toEqual([
      harvesters,
    ]);
    expect(filterArtPieces(artPieces, "harvest", "Landscape Painting")).toEqual(
      []
    );
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterArtPieces(artPieces, "nothing like this", "")).toEqual([]);
  });

  it("keeps the order of the art pieces", () => {
    expect(
      filterArtPieces(artPieces, "the", "").map((artPiece) => artPiece.slug)
    ).toEqual(["the-harvesters", "starry-night"]);
  });
});

describe("filterArtPieces by color families", () => {
  const redPiece = piece({
    slug: "red",
    name: "Red Study",
    genre: "Realism",
    colors: ["#FF0000", "#FF3C00"],
  });
  const bluePiece = piece({
    slug: "blue",
    name: "Blue Study",
    genre: "Realism",
    colors: ["#0000FF"],
  });
  const mixedPiece = piece({
    slug: "mixed",
    name: "Red and Blue",
    genre: "Cubism",
    colors: ["#FF0000", "#0000FF", "nonsense"],
  });
  const plainPiece = piece({ slug: "plain", name: "Plain", colors: [] });
  const colored = [redPiece, bluePiece, mixedPiece, plainPiece];

  function slugs(result: ArtPiece[]) {
    return result.map((artPiece) => artPiece.slug);
  }

  it("does not filter by color without selected families", () => {
    expect(slugs(filterArtPieces(colored, "", "", []))).toEqual([
      "red",
      "blue",
      "mixed",
      "plain",
    ]);
  });

  it("keeps the pieces that have a color of the selected family", () => {
    expect(slugs(filterArtPieces(colored, "", "", ["Red"]))).toEqual([
      "red",
      "mixed",
    ]);
    expect(slugs(filterArtPieces(colored, "", "", ["Blue"]))).toEqual([
      "blue",
      "mixed",
    ]);
  });

  it("keeps the pieces that have a color of any of several selected families", () => {
    expect(slugs(filterArtPieces(colored, "", "", ["Red", "Blue"]))).toEqual([
      "red",
      "blue",
      "mixed",
    ]);
  });

  it("never removes a piece when another family is selected", () => {
    const withOne = filterArtPieces(colored, "", "", ["Blue"]);
    const withTwo = filterArtPieces(colored, "", "", ["Blue", "Red"]);

    withOne.forEach((artPiece) => expect(withTwo).toContain(artPiece));
  });

  it("leaves out pieces without any matching color, including pieces without colors", () => {
    expect(slugs(filterArtPieces(colored, "", "", ["Green"]))).toEqual([]);
    expect(slugs(filterArtPieces(colored, "", "", ["Red"]))).not.toContain(
      "plain"
    );
  });

  it("needs a piece to match the color and the search", () => {
    expect(slugs(filterArtPieces(colored, "study", "", ["Red"]))).toEqual([
      "red",
    ]);
  });

  it("needs a piece to match the color and the genre", () => {
    expect(slugs(filterArtPieces(colored, "", "Cubism", ["Red"]))).toEqual([
      "mixed",
    ]);
    expect(slugs(filterArtPieces(colored, "", "Realism", ["Blue"]))).toEqual([
      "blue",
    ]);
  });

  it("needs a piece to match the color, the search and the genre", () => {
    expect(
      slugs(filterArtPieces(colored, "red", "Realism", ["Red", "Blue"]))
    ).toEqual(["red"]);
    expect(
      slugs(filterArtPieces(colored, "red", "Cubism", ["Red", "Blue"]))
    ).toEqual(["mixed"]);
    expect(
      slugs(filterArtPieces(colored, "blue", "Cubism", ["Green"]))
    ).toEqual([]);
  });
});

describe("getGenres", () => {
  it("lists every genre only once", () => {
    expect(getGenres(artPieces)).toHaveLength(2);
  });

  it("sorts the genres alphabetically", () => {
    expect(getGenres(artPieces)).toEqual(["Landscape Painting", "Renaissance"]);
  });

  it("is built from the art pieces it gets", () => {
    expect(getGenres([piece({ slug: "a", genre: "Cubism" })])).toEqual([
      "Cubism",
    ]);
  });

  it("returns an empty list when there are no art pieces", () => {
    expect(getGenres([])).toEqual([]);
  });
});
