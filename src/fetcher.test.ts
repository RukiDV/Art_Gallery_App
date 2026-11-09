import { fetcher } from "./fetcher";
import type { ArtPiece } from "./types";

const artPieces: ArtPiece[] = [
  {
    slug: "the-harvesters",
    artist: "Pieter Bruegel the Elder",
    name: "The Harvesters",
    imageSource: "https://example.com/the-harvesters.jpg",
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetcher", () => {
  it("returns the parsed art pieces", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => artPieces })
    );

    await expect(fetcher("/api/art")).resolves.toEqual(artPieces);
  });

  it("throws an error when the response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    await expect(fetcher("/api/art")).rejects.toThrow();
  });
});
