import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

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
  onAddComment: (slug: string, text: string) => void = () => {},
  onDeleteComment: (slug: string, id: string) => void = () => {},
  onEditComment: (slug: string, id: string, text: string) => void = () => {}
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
              onDeleteComment={onDeleteComment}
              onEditComment={onEditComment}
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
                id: "c1",
                text: "What a beautiful sky!",
                date: "2026-11-09T10:15:00.000Z",
              },
            ]
          : [
              {
                id: "c2",
                text: "Not for this piece",
                date: "2026-11-09T11:00:00.000Z",
              },
            ]
    );

    expect(
      screen.getByRole("heading", { name: "Comments" })
    ).toBeInTheDocument();
    expect(screen.getByText("What a beautiful sky!")).toBeInTheDocument();
    expect(screen.queryByText("Not for this piece")).not.toBeInTheDocument();
  });

  it("reports the slug and the id when a comment is deleted", async () => {
    const user = userEvent.setup();
    const onDeleteComment = vi.fn();
    renderDetails(
      "wheat-field-with-cypresses",
      () => false,
      () => {},
      () => [
        {
          id: "c1",
          text: "What a beautiful sky!",
          date: "2026-11-09T10:15:00.000Z",
        },
      ],
      () => {},
      onDeleteComment
    );

    await user.click(
      screen.getByRole("button", {
        name: "Delete comment: What a beautiful sky!",
      })
    );

    expect(onDeleteComment).toHaveBeenCalledTimes(1);
    expect(onDeleteComment).toHaveBeenCalledWith(
      "wheat-field-with-cypresses",
      "c1"
    );
  });

  it("reports the slug, the id and the new text when a comment is edited", async () => {
    const user = userEvent.setup();
    const onEditComment = vi.fn();
    renderDetails(
      "wheat-field-with-cypresses",
      () => false,
      () => {},
      () => [
        {
          id: "c1",
          text: "What a beautiful sky!",
          date: "2026-11-09T10:15:00.000Z",
        },
      ],
      () => {},
      () => {},
      onEditComment
    );

    await user.click(
      screen.getByRole("button", {
        name: "Edit comment: What a beautiful sky!",
      })
    );
    const field = screen.getByRole("textbox", { name: /^Edit your comment/ });
    await user.clear(field);
    await user.type(field, "What a stormy sky!");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onEditComment).toHaveBeenCalledTimes(1);
    expect(onEditComment).toHaveBeenCalledWith(
      "wheat-field-with-cypresses",
      "c1",
      "What a stormy sky!"
    );
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

  it("shows a link back to the gallery and a decorative empty frame for an unknown slug", () => {
    renderDetails("does-not-exist");

    expect(
      screen.getByRole("link", { name: "Back to the gallery" })
    ).toHaveAttribute("href", "/art-pieces");
    expect(document.querySelector(".empty-frame")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });
});

describe("ArtPieceDetailsPage: glow in the painting's color", () => {
  it.each([
    ["wheat-field-with-cypresses", "#718F98"],
    ["the-harvesters", "#37412E"],
  ])("tints the page with the first palette color of %s", (slug, color) => {
    renderDetails(slug);

    expect(
      screen.getByRole("article").style.getPropertyValue("--art-glow")
    ).toBe(color);
  });
});

describe("ArtPieceDetailsPage: large view", () => {
  function enlargeButton(name = "Wheat Field with Cypresses") {
    return screen.getByRole("button", { name: `Enlarge ${name}` });
  }

  it("makes the picture a button that is named Enlarge and still contains the picture", () => {
    renderDetails("wheat-field-with-cypresses");

    expect(enlargeButton()).toContainElement(
      screen.getByRole("img", { name: "Wheat Field with Cypresses" })
    );
  });

  it("has a decorative magnifier chip in the picture button", () => {
    renderDetails("wheat-field-with-cypresses");

    expect(enlargeButton().querySelector(".zoom-chip")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("shows no dialog until the picture is clicked", () => {
    renderDetails("wheat-field-with-cypresses");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it.each([
    [
      "wheat-field-with-cypresses",
      "Wheat Field with Cypresses",
      "Vincent van Gogh",
    ],
    ["the-harvesters", "The Harvesters", "Pieter Bruegel the Elder"],
  ])(
    "opens the large view of %s with its picture, title and artist",
    async (slug, name, artist) => {
      const user = userEvent.setup();
      renderDetails(slug);

      await user.click(enlargeButton(name));

      const dialog = within(screen.getByRole("dialog", { name }));
      expect(dialog.getByRole("img", { name })).toBeInTheDocument();
      expect(dialog.getByText(name)).toBeInTheDocument();
      expect(dialog.getByText(artist)).toBeInTheDocument();
    }
  );

  it("closes with the Close button and gives the focus back to the picture button", async () => {
    const user = userEvent.setup();
    renderDetails("wheat-field-with-cypresses");
    await user.click(enlargeButton());

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(enlargeButton()).toHaveFocus();
  });

  it("closes with Escape and gives the focus back to the picture button", async () => {
    const user = userEvent.setup();
    renderDetails("wheat-field-with-cypresses");
    await user.click(enlargeButton());

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(enlargeButton()).toHaveFocus();
  });

  it("opens with the keyboard", async () => {
    const user = userEvent.setup();
    renderDetails("wheat-field-with-cypresses");
    enlargeButton().focus();

    await user.keyboard("{Enter}");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("keeps the favorite button outside of the picture button, and it still works", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    renderDetails("wheat-field-with-cypresses", () => false, onToggleFavorite);
    const favorite = screen.getByRole("button", {
      name: "Favorite Wheat Field with Cypresses",
    });

    expect(enlargeButton()).not.toContainElement(favorite);

    await user.click(favorite);
    expect(onToggleFavorite).toHaveBeenCalledWith("wheat-field-with-cypresses");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("ArtPieceDetailsPage: previous and next", () => {
  const threePieces: ArtPiece[] = [
    ...artPieces,
    {
      slug: "the-kiss",
      artist: "Gustav Klimt",
      name: "The Kiss",
      imageSource: "https://example.com/the-kiss.jpg",
      year: "1908",
      genre: "Symbolism",
      colors: ["#C9A227"],
    },
  ];

  function Where() {
    return <p data-testid="path">{useLocation().pathname}</p>;
  }

  function renderBrowse(slug: string, pieces: ArtPiece[] = threePieces) {
    render(
      <MemoryRouter initialEntries={[`/art-pieces/${slug}`]}>
        <Routes>
          <Route
            path="/art-pieces/:slug"
            element={
              <>
                <ArtPieceDetailsPage
                  artPieces={pieces}
                  isFavorite={() => false}
                  onToggleFavorite={() => {}}
                  getComments={() => []}
                  onAddComment={() => {}}
                  onDeleteComment={() => {}}
                  onEditComment={() => {}}
                />
                <Where />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    );
  }

  function path() {
    return screen.getByTestId("path").textContent;
  }

  it("offers links to the previous and the next painting", () => {
    renderBrowse("wheat-field-with-cypresses");
    const group = within(
      screen.getByRole("group", { name: "Browse paintings" })
    );

    expect(
      group.getByRole("link", { name: "Previous: The Harvesters" })
    ).toHaveAttribute("href", "/art-pieces/the-harvesters");
    expect(group.getByRole("link", { name: "Next: The Kiss" })).toHaveAttribute(
      "href",
      "/art-pieces/the-kiss"
    );
  });

  it("wraps around: Previous of the first is the last, Next of the last is the first", () => {
    renderBrowse("the-harvesters");
    expect(
      screen.getByRole("link", { name: "Previous: The Kiss" })
    ).toHaveAttribute("href", "/art-pieces/the-kiss");

    cleanup();
    renderBrowse("the-kiss");
    expect(
      screen.getByRole("link", { name: "Next: The Harvesters" })
    ).toHaveAttribute("href", "/art-pieces/the-harvesters");
  });

  it("has no browse links with only one painting", () => {
    renderBrowse("the-harvesters", [artPieces[0]]);

    expect(
      screen.queryByRole("group", { name: "Browse paintings" })
    ).not.toBeInTheDocument();
  });

  it("is not a navigation landmark, and hides its arrows from screen readers", () => {
    renderBrowse("wheat-field-with-cypresses");

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    ["Previous: The Harvesters", "Next: The Kiss"].forEach((name) => {
      expect(
        screen.getByRole("link", { name }).querySelector("[aria-hidden='true']")
      ).toBeInTheDocument();
    });
  });

  it("shows the next painting when Next is clicked, and the previous one with Previous", async () => {
    const user = userEvent.setup();
    renderBrowse("wheat-field-with-cypresses");

    await user.click(screen.getByRole("link", { name: "Next: The Kiss" }));
    expect(path()).toBe("/art-pieces/the-kiss");
    expect(
      screen.getByRole("heading", { level: 2, name: "The Kiss" })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("link", { name: "Previous: Wheat Field with Cypresses" })
    );
    expect(path()).toBe("/art-pieces/wheat-field-with-cypresses");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Wheat Field with Cypresses",
      })
    ).toBeInTheDocument();
  });

  it("goes to the next painting with ArrowRight and to the previous one with ArrowLeft", async () => {
    const user = userEvent.setup();
    renderBrowse("wheat-field-with-cypresses");

    await user.keyboard("{ArrowRight}");
    expect(path()).toBe("/art-pieces/the-kiss");

    await user.keyboard("{ArrowLeft}");
    expect(path()).toBe("/art-pieces/wheat-field-with-cypresses");
  });

  it("leaves the arrow keys alone while typing in the comment field", async () => {
    const user = userEvent.setup();
    renderBrowse("wheat-field-with-cypresses");

    await user.type(
      screen.getByRole("textbox", { name: "Your comment" }),
      "ab{ArrowLeft}{ArrowRight}"
    );

    expect(path()).toBe("/art-pieces/wheat-field-with-cypresses");
  });

  it.each([
    ["Shift", "{Shift>}{ArrowRight}{/Shift}"],
    ["Control", "{Control>}{ArrowRight}{/Control}"],
    ["Alt", "{Alt>}{ArrowRight}{/Alt}"],
    ["Meta", "{Meta>}{ArrowRight}{/Meta}"],
  ])("ignores ArrowRight together with %s", async (_name, keys) => {
    const user = userEvent.setup();
    renderBrowse("wheat-field-with-cypresses");

    await user.keyboard(keys);

    expect(path()).toBe("/art-pieces/wheat-field-with-cypresses");
  });

  it("ignores the arrow keys while the large view is open", async () => {
    const user = userEvent.setup();
    renderBrowse("wheat-field-with-cypresses");
    await user.click(
      screen.getByRole("button", { name: "Enlarge Wheat Field with Cypresses" })
    );

    await user.keyboard("{ArrowRight}");

    expect(path()).toBe("/art-pieces/wheat-field-with-cypresses");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("starts the next painting with an empty comment field", async () => {
    const user = userEvent.setup();
    renderBrowse("wheat-field-with-cypresses");
    const field = screen.getByRole("textbox", { name: "Your comment" });
    await user.type(field, "half typed");

    await user.click(screen.getByRole("link", { name: "Next: The Kiss" }));

    expect(screen.getByRole("textbox", { name: "Your comment" })).toHaveValue(
      ""
    );
  });
});
