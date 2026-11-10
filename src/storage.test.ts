import { loadArtPiecesInfo, saveArtPiecesInfo, STORAGE_KEY } from "./storage";
import type { ArtPieceInfo } from "./types";

const info: ArtPieceInfo[] = [
  {
    slug: "the-harvesters",
    isFavorite: true,
    comments: [
      {
        id: "comment-1",
        text: "What a view!",
        date: "2026-11-09T10:15:00.000Z",
      },
    ],
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

describe("loadArtPiecesInfo with broken entries", () => {
  const validComment = {
    id: "comment-1",
    text: "What a view!",
    date: "2026-11-09T10:15:00.000Z",
  };

  it.each([
    ["null", null],
    ["a number", 1],
    ["a string", "text"],
    ["a list", []],
    ["an entry without a slug", { isFavorite: true, comments: [] }],
    [
      "an entry with a number as slug",
      { slug: 1, isFavorite: true, comments: [] },
    ],
    ["an entry without isFavorite", { slug: "x", comments: [] }],
    [
      "an entry with a text as isFavorite",
      { slug: "x", isFavorite: "yes", comments: [] },
    ],
    ["an entry without comments", { slug: "x", isFavorite: true }],
    [
      "an entry with a text as comments",
      { slug: "x", isFavorite: true, comments: "none" },
    ],
    [
      "an entry with a comment that is null",
      { slug: "x", isFavorite: true, comments: [null] },
    ],
    [
      "an entry with a comment without text",
      { slug: "x", isFavorite: true, comments: [{ date: validComment.date }] },
    ],
    [
      "an entry with a comment with a number as text",
      {
        slug: "x",
        isFavorite: true,
        comments: [{ text: 5, date: validComment.date }],
      },
    ],
    [
      "an entry with a comment without date",
      { slug: "x", isFavorite: true, comments: [{ text: "Hi" }] },
    ],
    [
      "an entry with a comment with a number as date",
      { slug: "x", isFavorite: true, comments: [{ text: "Hi", date: 5 }] },
    ],
  ])("ignores %s", (_description, brokenEntry) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([brokenEntry]));

    expect(loadArtPiecesInfo()).toEqual([]);
  });

  it("keeps the valid entries of a list that also has broken entries", () => {
    const brokenCommentEntry = {
      slug: "broken",
      isFavorite: true,
      comments: [{ text: "no date" }],
    };
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([null, info[0], 1, brokenCommentEntry, info[1]])
    );

    expect(loadArtPiecesInfo()).toEqual([info[0], info[1]]);
  });

  it("keeps an entry with several valid comments untouched", () => {
    const entry = {
      slug: "the-harvesters",
      isFavorite: false,
      comments: [
        validComment,
        {
          id: "comment-2",
          text: "Second",
          date: "2026-11-10T08:00:00.000Z",
        },
      ],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry]));

    expect(loadArtPiecesInfo()).toEqual([entry]);
  });
});

describe("loadArtPiecesInfo with comment ids", () => {
  const legacyComment = {
    text: "Saved before comments had an id",
    date: "2026-11-09T10:15:00.000Z",
  };

  it("gives a comment without an id a new id and keeps its text and date", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { slug: "the-harvesters", isFavorite: true, comments: [legacyComment] },
      ])
    );

    const [loaded] = loadArtPiecesInfo();

    expect(loaded.isFavorite).toBe(true);
    expect(loaded.comments).toHaveLength(1);
    expect(loaded.comments[0]).toMatchObject(legacyComment);
    expect(typeof loaded.comments[0].id).toBe("string");
    expect(loaded.comments[0].id).not.toBe("");
  });

  it("gives every comment without an id its own id", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          slug: "the-harvesters",
          isFavorite: false,
          comments: [legacyComment, legacyComment],
        },
      ])
    );

    const [loaded] = loadArtPiecesInfo();

    expect(loaded.comments).toHaveLength(2);
    expect(loaded.comments[0].id).not.toBe(loaded.comments[1].id);
  });

  it("keeps the id of a comment that already has one", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));

    expect(loadArtPiecesInfo()[0].comments[0].id).toBe("comment-1");
  });

  it("ignores an entry with a comment whose id is not a text", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          slug: "the-harvesters",
          isFavorite: true,
          comments: [{ ...legacyComment, id: 5 }],
        },
        info[1],
      ])
    );

    expect(loadArtPiecesInfo()).toEqual([info[1]]);
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
