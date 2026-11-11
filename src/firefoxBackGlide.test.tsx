import { addTransitionType } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

import ArtPieceDetailsPage from "./components/ArtPieceDetailsPage";
import ArtPiecePreview from "./components/ArtPiecePreview";
import { OPEN_DETAILS_TRANSITION } from "./components/TransitionLink";
import type { ArtPiece } from "./types";

// Firefox crashes when the picture glides back from the details page to the
// gallery. These tests check that Firefox gets a plain Back, that every other
// browser keeps the glide, and that opening a card glides everywhere.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, addTransitionType: vi.fn(actual.addTransitionType) };
});

const FIREFOX =
  "Mozilla/5.0 (X11; Linux x86_64; rv:159.0) Gecko/20100101 Firefox/159.0";
const CHROME =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";

const artPiece: ArtPiece = {
  slug: "the-harvesters",
  artist: "Pieter Bruegel the Elder",
  name: "The Harvesters",
  imageSource: "https://example.com/the-harvesters.jpg",
  year: "1565",
  genre: "Renaissance",
  colors: ["#37412E"],
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

function renderDetails() {
  render(
    <MemoryRouter initialEntries={["/art-pieces/the-harvesters"]}>
      <Routes>
        <Route path="/art-pieces" element={<p>Gallery page</p>} />
        <Route
          path="/art-pieces/:slug"
          element={
            <ArtPieceDetailsPage
              artPieces={[artPiece]}
              isFavorite={() => false}
              onToggleFavorite={() => {}}
              getComments={() => []}
              onAddComment={() => {}}
              onDeleteComment={() => {}}
              onEditComment={() => {}}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

function renderCard() {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route
          path="/"
          element={
            <ArtPiecePreview
              artPiece={artPiece}
              isFavorite={false}
              onToggleFavorite={() => {}}
            />
          }
        />
        <Route path="/art-pieces/:slug" element={<p>Details page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Back on the details page", () => {
  it("lets the picture glide back in browsers other than Firefox", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(CHROME);
    renderDetails();

    fireEvent.click(screen.getByRole("link", { name: "Back" }));

    expect(screen.getByText("Gallery page")).toBeInTheDocument();
    expect(addTransitionType).toHaveBeenCalledWith(OPEN_DETAILS_TRANSITION);
  });

  it("goes back without the glide in Firefox, and still goes back", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(FIREFOX);
    renderDetails();

    fireEvent.click(screen.getByRole("link", { name: "Back" }));

    expect(screen.getByText("Gallery page")).toBeInTheDocument();
    expect(addTransitionType).not.toHaveBeenCalled();
  });

  it.each([
    ["Firefox", FIREFOX],
    ["Chrome", CHROME],
  ])("is a link to the gallery in %s", (_name, userAgent) => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);
    renderDetails();

    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
      "href",
      "/art-pieces"
    );
  });
});

describe("Opening a card", () => {
  it.each([
    ["Firefox", FIREFOX],
    ["Chrome", CHROME],
  ])(
    "still lets the picture glide to the details in %s",
    (_name, userAgent) => {
      vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);
      renderCard();

      fireEvent.click(screen.getByRole("link"));

      expect(screen.getByText("Details page")).toBeInTheDocument();
      expect(addTransitionType).toHaveBeenCalledWith(OPEN_DETAILS_TRANSITION);
    }
  );
});
