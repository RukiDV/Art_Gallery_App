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
  colors: ["#000000"],
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

describe("getRandomArtPiece without a piece that is left out", () => {
  const fractions = [0, 0.25, 0.5, 0.75, 0.999];

  it.each(["first", "second", "third"])(
    "never returns the piece %s when it is left out, whatever the random value",
    (slug) => {
      fractions.forEach((fraction) => {
        mockRandomFraction(fraction);

        expect(getRandomArtPiece(artPieces, slug).slug).not.toBe(slug);
      });
    }
  );

  it.each([
    [0, "first"],
    [0.4, "first"],
    [0.5, "third"],
    [0.999, "third"],
  ])(
    "picks among the other pieces: leaving out 'second' with the random fraction %s gives %s",
    (fraction, slug) => {
      mockRandomFraction(fraction);

      expect(getRandomArtPiece(artPieces, "second").slug).toBe(slug);
    }
  );

  it("returns the other piece when there are only two", () => {
    const two = artPieces.slice(0, 2);

    fractions.forEach((fraction) => {
      mockRandomFraction(fraction);

      expect(getRandomArtPiece(two, "first").slug).toBe("second");
      expect(getRandomArtPiece(two, "second").slug).toBe("first");
    });
  });

  it("returns the only piece when there is no other one", () => {
    mockRandomFraction(0.5);

    expect(getRandomArtPiece([artPieces[0]], "first").slug).toBe("first");
  });

  it("ignores a slug that no piece has", () => {
    mockRandomFraction(0.5);

    expect(getRandomArtPiece(artPieces, "unknown").slug).toBe("second");
  });
});
