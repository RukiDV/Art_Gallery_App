import { moveFavorite } from "./favoriteOrder";
import type { ArtPieceComment, ArtPieceInfo } from "./types";

function info(
  slug: string,
  isFavorite: boolean,
  comments: ArtPieceComment[] = []
): ArtPieceInfo {
  return { slug, isFavorite, comments };
}

function slugs(infos: ArtPieceInfo[]) {
  return infos.map((entry) => entry.slug);
}

describe("moveFavorite", () => {
  const favorites = [info("a", true), info("b", true), info("c", true)];

  it("moves a favorite to an earlier position", () => {
    expect(slugs(moveFavorite(favorites, "c", 0))).toEqual(["c", "a", "b"]);
    expect(slugs(moveFavorite(favorites, "c", 1))).toEqual(["a", "c", "b"]);
  });

  it("moves a favorite to a later position", () => {
    expect(slugs(moveFavorite(favorites, "a", 2))).toEqual(["b", "c", "a"]);
    expect(slugs(moveFavorite(favorites, "a", 1))).toEqual(["b", "a", "c"]);
  });

  it("keeps a position inside the list", () => {
    expect(slugs(moveFavorite(favorites, "a", 99))).toEqual(["b", "c", "a"]);
    expect(slugs(moveFavorite(favorites, "c", -5))).toEqual(["c", "a", "b"]);
  });

  it("returns the same list when nothing changes", () => {
    expect(moveFavorite(favorites, "b", 1)).toBe(favorites);
    expect(moveFavorite(favorites, "a", -3)).toBe(favorites);
    expect(moveFavorite(favorites, "c", 50)).toBe(favorites);
  });

  it("changes nothing for an unknown piece or a piece that is not a favorite", () => {
    const withOther = [info("a", true), info("x", false), info("b", true)];

    expect(moveFavorite(withOther, "nobody", 0)).toBe(withOther);
    expect(moveFavorite(withOther, "x", 0)).toBe(withOther);
  });

  it("leaves entries that are not favorites where they are", () => {
    const mixed = [
      info("x", false),
      info("a", true),
      info("y", false),
      info("b", true),
      info("c", true),
    ];

    expect(slugs(moveFavorite(mixed, "c", 0))).toEqual([
      "x",
      "c",
      "y",
      "a",
      "b",
    ]);
  });

  it("keeps the comments and the favorite marks of every entry", () => {
    const comment: ArtPieceComment = {
      id: "1",
      text: "Lovely",
      date: "2026-11-11T10:00:00.000Z",
    };
    const entries = [info("a", true, [comment]), info("b", true)];

    const moved = moveFavorite(entries, "b", 0);

    expect(moved[1]).toBe(entries[0]);
    expect(moved[1].comments).toEqual([comment]);
    expect(moved.every((entry) => entry.isFavorite)).toBe(true);
  });

  it("does not change the list it was given", () => {
    const original = [info("a", true), info("b", true)];

    moveFavorite(original, "b", 0);

    expect(slugs(original)).toEqual(["a", "b"]);
  });
});
