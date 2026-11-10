import {
  COLOR_FAMILIES,
  getColorFamilies,
  getColorFamily,
} from "./colorFamilies";
import type { ArtPiece } from "./types";

function piece(slug: string, colors: string[]): ArtPiece {
  return {
    slug,
    name: slug,
    artist: "Unknown Artist",
    imageSource: `https://example.com/${slug}.jpg`,
    year: "1900",
    genre: "Other",
    colors,
  };
}

describe("COLOR_FAMILIES", () => {
  it("lists the families in a fixed order, each with a circle color", () => {
    expect(COLOR_FAMILIES.map((family) => family.name)).toEqual([
      "Red",
      "Orange",
      "Yellow",
      "Green",
      "Blue",
      "Purple",
      "Brown",
      "Neutral",
    ]);
    COLOR_FAMILIES.forEach((family) =>
      expect(family.color).toMatch(/^#[0-9a-f]{6}$/i)
    );
  });
});

describe("getColorFamily", () => {
  it.each([
    ["#FF0000", "Red"],
    ["#FFA500", "Orange"],
    ["#FFFF00", "Yellow"],
    ["#00FF00", "Green"],
    ["#0000FF", "Blue"],
    ["#800080", "Purple"],
    ["#8B4513", "Brown"],
    ["#000000", "Neutral"],
    ["#FFFFFF", "Neutral"],
    ["#808080", "Neutral"],
  ])("puts %s into the family %s", (hex, family) => {
    expect(getColorFamily(hex)).toBe(family);
  });

  it.each([
    ["#37412E", "Green"],
    ["#8D7332", "Brown"],
    ["#718F98", "Blue"],
    ["#9DA59E", "Neutral"],
  ])(
    "puts the palette color %s of the test paintings into %s",
    (hex, family) => {
      expect(getColorFamily(hex)).toBe(family);
    }
  );

  it("separates red from orange at the hue of 15 degrees", () => {
    expect(getColorFamily("#FF3C00")).toBe("Red");
    expect(getColorFamily("#FF4000")).toBe("Orange");
  });

  it("separates orange from yellow at the hue of 40 degrees", () => {
    expect(getColorFamily("#FFA500")).toBe("Orange");
    expect(getColorFamily("#FFB000")).toBe("Yellow");
  });

  it("calls a dark orange brown and a lighter one orange", () => {
    expect(getColorFamily("#8B5A2B")).toBe("Brown");
    expect(getColorFamily("#E67E22")).toBe("Orange");
  });

  it("calls very dark and very light colors neutral, whatever their hue", () => {
    expect(getColorFamily("#0A0A14")).toBe("Neutral");
    expect(getColorFamily("#F5F5FF")).toBe("Neutral");
  });

  it("accepts lower case hex values", () => {
    expect(getColorFamily("#ff0000")).toBe("Red");
  });

  it.each([[""], ["red"], ["#12"], ["#GGGGGG"], ["FF0000"], ["#FF00000"]])(
    "gives no family for the invalid value '%s'",
    (value) => {
      expect(getColorFamily(value)).toBeUndefined();
    }
  );
});

describe("getColorFamilies", () => {
  it("lists the families that occur in the palettes, each once, in the fixed order", () => {
    const artPieces = [
      piece("a", ["#0000FF", "#FF0000"]),
      piece("b", ["#FF0000", "#00FF00"]),
    ];

    expect(getColorFamilies(artPieces)).toEqual(["Red", "Green", "Blue"]);
  });

  it("does not list families that no piece has", () => {
    expect(getColorFamilies([piece("a", ["#FF0000"])])).toEqual(["Red"]);
  });

  it("ignores invalid colors", () => {
    expect(getColorFamilies([piece("a", ["nonsense", "#0000FF"])])).toEqual([
      "Blue",
    ]);
  });

  it("returns an empty list for pieces without colors or without pieces", () => {
    expect(getColorFamilies([piece("a", [])])).toEqual([]);
    expect(getColorFamilies([])).toEqual([]);
  });
});
