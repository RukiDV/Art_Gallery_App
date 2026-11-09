import { loadArtPiecesInfo, saveArtPiecesInfo, STORAGE_KEY } from "./storage";
import type { ArtPieceInfo } from "./types";

const info: ArtPieceInfo[] = [
  {
    slug: "the-harvesters",
    isFavorite: true,
    comments: [{ text: "What a view!", date: "2026-11-09T10:15:00.000Z" }],
  },
  { slug: "wheat-field-with-cypresses", isFavorite: false, comments: [] },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("loadArtPiecesInfo", () => {
  it("returns an empty list when nothing is stored", () => {
    expect(loadArtPiecesInfo()).toEqual([]);
  });

  it("returns what was saved, including favorites and comments", () => {
    saveArtPiecesInfo(info);

    expect(loadArtPiecesInfo()).toEqual(info);
  });

  it("returns an empty list when the stored value is not valid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");

    expect(loadArtPiecesInfo()).toEqual([]);
  });

  it("returns an empty list when the stored value is not a list", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ slug: "x" }));

    expect(loadArtPiecesInfo()).toEqual([]);
  });

  it("returns an empty list when the local storage cannot be read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage is blocked");
    });

    expect(loadArtPiecesInfo()).toEqual([]);
  });
});

describe("saveArtPiecesInfo", () => {
  it("stores the list as JSON under one key", () => {
    saveArtPiecesInfo(info);

    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(info));
  });

  it("does not throw when the local storage cannot be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage is full");
    });

    expect(() => saveArtPiecesInfo(info)).not.toThrow();
  });
});
