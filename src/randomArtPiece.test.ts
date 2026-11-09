import { mockRandomFraction } from "./mockRandom";
import { getRandomArtPiece } from "./randomArtPiece";
import type { ArtPiece } from "./types";

const artPieces: ArtPiece[] = ["first", "second", "third"].map((slug) => ({
  slug,
  artist: `Artist ${slug}`,
  name: `Name ${slug}`,
  imageSource: `https://example.com/${slug}.jpg`,
  year: "1900",
  genre: "Genre",
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getRandomArtPiece", () => {
  it.each([
    [0, "first"],
    [0.5, "second"],
    [0.999, "third"],
  ])(
    "returns the matching art piece for the random fraction %s",
    (fraction, slug) => {
      mockRandomFraction(fraction);

      expect(getRandomArtPiece(artPieces).slug).toBe(slug);
    }
  );
});
