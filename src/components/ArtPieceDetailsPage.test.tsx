import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

import type { ArtPiece, ArtPieceComment } from "../types";
import ArtPieceDetailsPage from "./ArtPieceDetailsPage";

const artPieces: ArtPiece[] = [
  {
    slug: "the-harvesters",
    artist: "Pieter Bruegel the Elder",
    name: "The Harvesters",
    imageSource: "https://example.com/the-harvesters.jpg",
    year: "1565",
    genre: "Renaissance",
    colors: ["#37412E", "#8D7332"],
  },
  {
    slug: "wheat-field-with-cypresses",
    artist: "Vincent van Gogh",
    name: "Wheat Field with Cypresses",
    imageSource: "https://example.com/wheat-field.jpg",
    year: "1889",
    genre: "Landscape Painting",
    colors: ["#718F98", "#9DA59E"],
  },
];

function renderDetails(
  slug: string,
  isFavorite: (slug: string) => boolean = () => false,
  onToggleFavorite: (slug: string) => void = () => {},
  getComments: (slug: string) => ArtPieceComment[] = () => [],
  onAddComment: (slug: string, text: string) => void = () => {}
) {
  render(
    <MemoryRouter initialEntries={[`/art-pieces/${slug}`]}>
      <Routes>
        <Route
          path="/art-pieces/:slug"
          element={
            <ArtPieceDetailsPage
              artPieces={artPieces}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
              getComments={getComments}
              onAddComment={onAddComment}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ArtPieceDetailsPage", () => {
  it("shows the comments of the art piece in a Comments section", () => {
    renderDetails(
      "wheat-field-with-cypresses",
      () => false,
      () => {},
      (commentSlug) =>
        commentSlug === "wheat-field-with-cypresses"
          ? [
              {
                text: "What a beautiful sky!",
                date: "2026-11-09T10:15:00.000Z",
              },
            ]
          : [{ text: "Not for this piece", date: "2026-11-09T11:00:00.000Z" }]
    );

    expect(
      screen.getByRole("heading", { name: "Comments" })
    ).toBeInTheDocument();
    expect(screen.getByText("What a beautiful sky!")).toBeInTheDocument();
    expect(screen.queryByText("Not for this piece")).not.toBeInTheDocument();
  });

  it("shows a comment form that reports the slug and the text", async () => {
    const user = userEvent.setup();
    const onAddComment = vi.fn();
    renderDetails(
      "wheat-field-with-cypresses",
      () => false,
      () => {},
      () => [],
      onAddComment
    );

    await user.type(
      screen.getByRole("textbox", { name: "Your comment" }),
      "What a beautiful sky!"
    );
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(onAddComment).toHaveBeenCalledTimes(1);
    expect(onAddComment).toHaveBeenCalledWith(
      "wheat-field-with-cypresses",
      "What a beautiful sky!"
    );
  });

  it("shows no comments section and no form for an unknown slug", () => {
    renderDetails("does-not-exist");

    expect(
      screen.queryByRole("heading", { name: "Comments" })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows a favorite button for the art piece", () => {
    renderDetails(
      "wheat-field-with-cypresses",
      (favoriteSlug) => favoriteSlug === "wheat-field-with-cypresses"
    );

    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("reports the slug of the art piece when the button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    renderDetails("wheat-field-with-cypresses", () => false, onToggleFavorite);

    await user.click(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    );

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledWith("wheat-field-with-cypresses");
  });

  it("shows the image of the art piece with the given slug", () => {
    renderDetails("wheat-field-with-cypresses");

    const image = screen.getByRole("img", {
      name: "Wheat Field with Cypresses",
    });
    expect(image).toHaveAttribute("src", artPieces[1].imageSource);
  });

  it("shows the title as a heading", () => {
    renderDetails("wheat-field-with-cypresses");

    expect(
      screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();
  });

  it("shows the artist, the year and the genre", () => {
    renderDetails("wheat-field-with-cypresses");

    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
    expect(screen.getByText("1889")).toBeInTheDocument();
    expect(screen.getByText("Landscape Painting")).toBeInTheDocument();
  });

  it("shows the color palette of the art piece", () => {
    renderDetails("wheat-field-with-cypresses");

    const palette = screen.getByRole("list", { name: "Color palette" });

    expect(within(palette).getAllByRole("listitem")).toHaveLength(2);
    expect(within(palette).getByTitle("#718F98")).toBeInTheDocument();
    expect(within(palette).getByTitle("#9DA59E")).toBeInTheDocument();
  });

  it("does not show the colors of another art piece", () => {
    renderDetails("wheat-field-with-cypresses");

    expect(screen.queryByTitle("#37412E")).not.toBeInTheDocument();
    expect(screen.queryByTitle("#8D7332")).not.toBeInTheDocument();
  });

  it("shows no color palette for an unknown slug", () => {
    renderDetails("does-not-exist");

    expect(
      screen.queryByRole("list", { name: "Color palette" })
    ).not.toBeInTheDocument();
  });

  it("does not show another art piece", () => {
    renderDetails("wheat-field-with-cypresses");

    expect(screen.queryByText("The Harvesters")).not.toBeInTheDocument();
  });

  it("shows a back link to the gallery", () => {
    renderDetails("wheat-field-with-cypresses");

    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
      "href",
      "/art-pieces"
    );
  });

  it('shows "Art piece not found" for an unknown slug', () => {
    renderDetails("does-not-exist");

    expect(screen.getByText("Art piece not found")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
