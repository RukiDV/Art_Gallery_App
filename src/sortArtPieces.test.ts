import { getStartYear, SORT_OPTIONS, sortArtPieces } from "./sortArtPieces";
import type { ArtPiece } from "./types";

function piece(name: string, artist: string, year: string): ArtPiece {
  return {
    slug: name.toLowerCase().replace(/\W+/g, "-"),
    name,
    artist,
    year,
    imageSource: "https://example.com/picture.jpg",
    genre: "Genre",
    colors: [],
  };
}

function names(artPieces: ArtPiece[]) {
  return artPieces.map((artPiece) => artPiece.name);
}

describe("getStartYear", () => {
  it.each([
    ["1889", 1889],
    ["1887–88", 1887],
    ["1890–92", 1890],
    ["ca. 1704–9", 1704],
    ["ca. 1830–32", 1830],
    ["1912–13", 1912],
    ["2020", 2020],
  ])("reads the start year of %s", (year, expected) => {
    expect(getStartYear(year)).toBe(expected);
  });

  it.each([[""], ["unknown"], ["c. 99"], ["ca. 12"]])(
    "has no year for '%s'",
    (year) => {
      expect(getStartYear(year)).toBeUndefined();
    }
  );
});

describe("SORT_OPTIONS", () => {
  it("offers the default order, name, artist and year in both directions", () => {
    expect(SORT_OPTIONS).toEqual([
      { value: "default", label: "Default order" },
      { value: "name", label: "Name (A–Z)" },
      { value: "artist", label: "Artist (A–Z)" },
      { value: "year-asc", label: "Year (oldest first)" },
      { value: "year-desc", label: "Year (newest first)" },
    ]);
  });
});

describe("sortArtPieces", () => {
  const wheat = piece("Wheat Field with Cypresses", "Vincent van Gogh", "1889");
  const roulin = piece(
    "Madame Roulin and Her Baby",
    "Vincent van Gogh",
    "1888"
  );
  const harvesters = piece(
    "The Harvesters",
    "Pieter Bruegel the Elder",
    "1565"
  );
  const circus = piece("Circus Sideshow", "Georges Seurat", "1887–88");
  const waves = piece("Rough Waves", "Ogata Kōrin", "ca. 1704–9");
  const apiOrder = [wheat, roulin, harvesters, circus, waves];

  it("keeps the order it was given for the default order", () => {
    expect(names(sortArtPieces(apiOrder, "default"))).toEqual(names(apiOrder));
  });

  it("sorts by name from A to Z", () => {
    expect(names(sortArtPieces(apiOrder, "name"))).toEqual([
      "Circus Sideshow",
      "Madame Roulin and Her Baby",
      "Rough Waves",
      "The Harvesters",
      "Wheat Field with Cypresses",
    ]);
  });

  it("sorts by artist from A to Z, and keeps the order of one artist's paintings", () => {
    expect(names(sortArtPieces(apiOrder, "artist"))).toEqual([
      "Circus Sideshow", // Georges Seurat
      "Rough Waves", // Ogata Kōrin
      "The Harvesters", // Pieter Bruegel the Elder
      "Wheat Field with Cypresses", // Vincent van Gogh, first in the list
      "Madame Roulin and Her Baby", // Vincent van Gogh, second in the list
    ]);
  });

  it("sorts by year, oldest first, using the start of a range", () => {
    expect(names(sortArtPieces(apiOrder, "year-asc"))).toEqual([
      "The Harvesters", // 1565
      "Rough Waves", // ca. 1704–9
      "Circus Sideshow", // 1887–88
      "Madame Roulin and Her Baby", // 1888
      "Wheat Field with Cypresses", // 1889
    ]);
  });

  it("sorts by year, newest first", () => {
    expect(names(sortArtPieces(apiOrder, "year-desc"))).toEqual([
      "Wheat Field with Cypresses", // 1889
      "Madame Roulin and Her Baby", // 1888
      "Circus Sideshow", // 1887–88
      "Rough Waves", // ca. 1704–9
      "The Harvesters", // 1565
    ]);
  });

  it("puts paintings without a readable year last, in both directions", () => {
    const withUnknown = [
      piece("A unknown", "Artist", "unknown"),
      piece("B new", "Artist", "2020"),
      piece("C empty", "Artist", ""),
      piece("D old", "Artist", "1500"),
    ];

    expect(names(sortArtPieces(withUnknown, "year-asc"))).toEqual([
      "D old",
      "B new",
      "A unknown",
      "C empty",
    ]);
    expect(names(sortArtPieces(withUnknown, "year-desc"))).toEqual([
      "B new",
      "D old",
      "A unknown",
      "C empty",
    ]);
  });

  it("ignores upper and lower case when it sorts by name", () => {
    const mixed = [
      piece("banana", "A", "1"),
      piece("Cherry", "A", "1"),
      piece("Apple", "A", "1"),
    ];

    expect(names(sortArtPieces(mixed, "name"))).toEqual([
      "Apple",
      "banana",
      "Cherry",
    ]);
  });

  it("sorts letters with accents next to their plain letters", () => {
    const artists = [
      piece("One", "Paul Czerny", "1"),
      piece("Two", "Paul Cézanne", "1"),
      piece("Three", "Paul Cassirer", "1"),
    ];

    expect(names(sortArtPieces(artists, "artist"))).toEqual([
      "Three",
      "Two",
      "One",
    ]);
  });

  it("does not change the list it was given", () => {
    const original = [...apiOrder];

    sortArtPieces(apiOrder, "name");
    sortArtPieces(apiOrder, "year-desc");

    expect(apiOrder).toEqual(original);
  });

  it("works with an empty list", () => {
    expect(sortArtPieces([], "name")).toEqual([]);
  });
});
