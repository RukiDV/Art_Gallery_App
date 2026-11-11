import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

import type { ArtPiece } from "../types";
import FavoritesPage from "./FavoritesPage";

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

function renderFavorites(
  isFavorite: (slug: string) => boolean,
  onToggleFavorite: (slug: string) => void = () => {}
) {
  render(
    <MemoryRouter>
      <FavoritesPage
        artPieces={artPieces}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
    </MemoryRouter>
  );
}

describe("FavoritesPage", () => {
  it("lists only the favorite art pieces", () => {
    renderFavorites((slug) => slug === "wheat-field-with-cypresses");

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Wheat Field with Cypresses")).toBeInTheDocument();
    expect(screen.queryByText("The Harvesters")).not.toBeInTheDocument();
  });

  it("shows the image, the title and the artist of a favorite", () => {
    renderFavorites((slug) => slug === "wheat-field-with-cypresses");

    const image = screen.getByRole("img", {
      name: "Wheat Field with Cypresses",
    });
    expect(image).toHaveAttribute("src", artPieces[1].imageSource);
    expect(
      screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();
    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
  });

  it("shows an active favorite button on each favorite", () => {
    renderFavorites(() => true);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) =>
      expect(button).toHaveAttribute("aria-pressed", "true")
    );
  });

  it("reports the slug of the art piece when its favorite button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    renderFavorites(() => true, onToggleFavorite);

    await user.click(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    );

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledWith("the-harvesters");
  });

  it('shows "No favorites yet" and no list when nothing is a favorite', () => {
    renderFavorites(() => false);

    expect(screen.getByText("No favorites yet")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

describe("FavoritesPage: order", () => {
  function renderOrdered(favoriteOrder?: string[]) {
    render(
      <MemoryRouter>
        <FavoritesPage
          artPieces={artPieces}
          isFavorite={() => true}
          onToggleFavorite={() => {}}
          favoriteOrder={favoriteOrder}
        />
      </MemoryRouter>
    );
    return screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
  }

  it("keeps the order of the gallery when no order is given", () => {
    expect(renderOrdered()).toEqual([
      "The Harvesters",
      "Wheat Field with Cypresses",
    ]);
  });

  it("lists the favorites in the order in which they were added", () => {
    expect(
      renderOrdered(["wheat-field-with-cypresses", "the-harvesters"])
    ).toEqual(["Wheat Field with Cypresses", "The Harvesters"]);
  });

  it("puts a favorite that is not in the order at the end", () => {
    expect(renderOrdered(["wheat-field-with-cypresses"])).toEqual([
      "Wheat Field with Cypresses",
      "The Harvesters",
    ]);
  });
});

describe("FavoritesPage: empty state", () => {
  it("shows a decorative empty frame with the message", () => {
    renderFavorites(() => false);

    expect(document.querySelector(".empty-frame")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    expect(screen.getByText("No favorites yet")).toBeInTheDocument();
  });

  it("draws a heart in the frame as an icon, not as a text character", () => {
    renderFavorites(() => false);

    const frame = document.querySelector(".empty-frame");
    expect(frame?.querySelector("svg")).toBeInTheDocument();
    expect(frame).toHaveTextContent("");
  });

  it("offers a link to the gallery", () => {
    renderFavorites(() => false);

    expect(
      screen.getByRole("link", { name: "Browse the gallery" })
    ).toHaveAttribute("href", "/art-pieces");
  });

  it("shows neither the frame nor the link when there are favorites", () => {
    renderFavorites((slug) => slug === "the-harvesters");

    expect(document.querySelector(".empty-frame")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Browse the gallery" })
    ).not.toBeInTheDocument();
  });
});

describe("FavoritesPage: arranging", () => {
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
  const order = ["the-harvesters", "wheat-field-with-cypresses", "the-kiss"];

  function Where() {
    return <p data-testid="path">{useLocation().pathname}</p>;
  }

  function page(
    options: {
      pieces?: ArtPiece[];
      isFavorite?: (slug: string) => boolean;
      onMoveFavorite?: (slug: string, toIndex: number) => void;
      onToggleFavorite?: (slug: string) => void;
      favoriteOrder?: string[];
    } = {}
  ) {
    const {
      pieces = threePieces,
      isFavorite = () => true,
      onMoveFavorite = () => {},
      onToggleFavorite = () => {},
      favoriteOrder = order,
    } = options;

    return (
      <MemoryRouter>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <FavoritesPage
                  artPieces={pieces}
                  isFavorite={isFavorite}
                  onToggleFavorite={onToggleFavorite}
                  favoriteOrder={favoriteOrder}
                  onMoveFavorite={onMoveFavorite}
                />
                <Where />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    );
  }

  // A page that really reorders, like the App does.
  function ReorderingPage() {
    const [slugs, setSlugs] = useState(order);

    return page({
      favoriteOrder: slugs,
      onMoveFavorite: (slug, toIndex) =>
        setSlugs((current) => {
          const next = current.filter((entry) => entry !== slug);
          next.splice(toIndex, 0, slug);
          return next;
        }),
    });
  }

  function titles() {
    return screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
  }

  async function startArranging(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "Arrange" }));
  }

  it("has no Arrange button when the page cannot move favorites", () => {
    render(
      <MemoryRouter>
        <FavoritesPage
          artPieces={threePieces}
          isFavorite={() => true}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );

    expect(
      screen.queryByRole("button", { name: "Arrange" })
    ).not.toBeInTheDocument();
  });

  it("has no Arrange button with fewer than two favorites", () => {
    render(page({ isFavorite: (slug) => slug === "the-kiss" }));

    expect(
      screen.queryByRole("button", { name: "Arrange" })
    ).not.toBeInTheDocument();
  });

  it("switches between Arrange and Done", async () => {
    const user = userEvent.setup();
    render(page());

    await startArranging(user);
    expect(
      screen.queryByRole("button", { name: "Arrange" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.getByRole("button", { name: "Arrange" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Move / })
    ).not.toBeInTheDocument();
  });

  it("does not make the frames draggable before Arrange is pressed", async () => {
    const user = userEvent.setup();
    render(page());
    const frames = screen.getAllByRole("listitem");

    expect(frames[0]).not.toHaveAttribute("draggable", "true");

    await startArranging(user);

    screen.getAllByRole("listitem").forEach((frame) => {
      expect(frame).toHaveAttribute("draggable", "true");
    });
  });

  it("shows Move earlier and Move later buttons named after each painting", async () => {
    const user = userEvent.setup();
    render(page());

    await startArranging(user);

    expect(
      screen.getAllByRole("button", { name: /^Move .* earlier$/ })
    ).toHaveLength(3);
    expect(
      screen.getAllByRole("button", { name: /^Move .* later$/ })
    ).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: "Move The Harvesters earlier" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Move The Kiss later" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Move The Harvesters later" })
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Move The Kiss earlier" })
    ).toBeEnabled();
  });

  it("moves a painting one place with a Move button and announces its new position", async () => {
    const user = userEvent.setup();
    const onMoveFavorite = vi.fn();
    render(page({ onMoveFavorite }));
    await startArranging(user);

    await user.click(
      screen.getByRole("button", { name: "Move The Harvesters later" })
    );

    expect(onMoveFavorite).toHaveBeenCalledWith("the-harvesters", 1);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Moved The Harvesters to position 2 of 3"
    );

    await user.click(
      screen.getByRole("button", { name: "Move The Kiss earlier" })
    );

    expect(onMoveFavorite).toHaveBeenLastCalledWith("the-kiss", 1);
  });

  it("keeps the focus on the same button after a move, or on its partner at the end", async () => {
    const user = userEvent.setup();
    render(<ReorderingPage />);
    await startArranging(user);

    await user.click(
      screen.getByRole("button", { name: "Move The Harvesters later" })
    );
    expect(titles()).toEqual([
      "Wheat Field with Cypresses",
      "The Harvesters",
      "The Kiss",
    ]);
    expect(
      screen.getByRole("button", { name: "Move The Harvesters later" })
    ).toHaveFocus();

    await user.click(
      screen.getByRole("button", { name: "Move The Harvesters later" })
    );
    expect(titles()).toEqual([
      "Wheat Field with Cypresses",
      "The Kiss",
      "The Harvesters",
    ]);
    expect(
      screen.getByRole("button", { name: "Move The Harvesters later" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Move The Harvesters earlier" })
    ).toHaveFocus();
  });

  it("does not open a painting from a click while arranging, but does otherwise", async () => {
    const user = userEvent.setup();
    render(page());

    await startArranging(user);
    await user.click(screen.getAllByRole("link")[0]);
    expect(screen.getByTestId("path")).toHaveTextContent("/");

    await user.click(screen.getByRole("button", { name: "Done" }));
    await user.click(screen.getAllByRole("link")[0]);
    expect(screen.getByTestId("path")).toHaveTextContent(
      "/art-pieces/the-harvesters"
    );
  });

  it("still lets a favorite be removed with its heart while arranging", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    render(page({ onToggleFavorite }));
    await startArranging(user);

    await user.click(screen.getByRole("button", { name: "Favorite The Kiss" }));

    expect(onToggleFavorite).toHaveBeenCalledWith("the-kiss");
  });

  it("ends arranging by itself when only one favorite is left", async () => {
    const user = userEvent.setup();
    const { rerender } = render(page());
    await startArranging(user);

    rerender(page({ isFavorite: (slug) => slug === "the-kiss" }));

    expect(
      screen.queryByRole("button", { name: "Done" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Move / })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Arrange" })
    ).not.toBeInTheDocument();
  });
});

describe("FavoritesPage: dragging", () => {
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

  async function arrangeThree(onMoveFavorite = vi.fn()) {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <FavoritesPage
          artPieces={threePieces}
          isFavorite={() => true}
          onToggleFavorite={() => {}}
          favoriteOrder={[
            "the-harvesters",
            "wheat-field-with-cypresses",
            "the-kiss",
          ]}
          onMoveFavorite={onMoveFavorite}
        />
      </MemoryRouter>
    );
    await user.click(screen.getByRole("button", { name: "Arrange" }));
    return { frames: screen.getAllByRole("listitem"), onMoveFavorite };
  }

  it("moves a dragged frame to the place of the frame it is dropped on", async () => {
    const { frames, onMoveFavorite } = await arrangeThree();

    fireEvent.dragStart(frames[0]);
    fireEvent.dragOver(frames[2]);
    fireEvent.drop(frames[2]);

    expect(onMoveFavorite).toHaveBeenCalledTimes(1);
    expect(onMoveFavorite).toHaveBeenCalledWith("the-harvesters", 2);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Moved The Harvesters to position 3 of 3"
    );
  });

  it("moves a frame dragged to an earlier place", async () => {
    const { frames, onMoveFavorite } = await arrangeThree();

    fireEvent.dragStart(frames[2]);
    fireEvent.dragOver(frames[0]);
    fireEvent.drop(frames[0]);

    expect(onMoveFavorite).toHaveBeenCalledWith("the-kiss", 0);
  });

  it("does nothing when a frame is dropped on itself", async () => {
    const { frames, onMoveFavorite } = await arrangeThree();

    fireEvent.dragStart(frames[1]);
    fireEvent.dragOver(frames[1]);
    fireEvent.drop(frames[1]);

    expect(onMoveFavorite).not.toHaveBeenCalled();
  });

  it("does nothing for a drop without a dragged frame", async () => {
    const { frames, onMoveFavorite } = await arrangeThree();

    fireEvent.drop(frames[1]);

    expect(onMoveFavorite).not.toHaveBeenCalled();
  });

  it("hands the browser the data it needs to start a drag", async () => {
    const { frames } = await arrangeThree();
    const dataTransfer = { setData: vi.fn(), effectAllowed: "" };

    fireEvent.dragStart(frames[0], { dataTransfer });

    expect(dataTransfer.setData).toHaveBeenCalledWith(
      "text/plain",
      "the-harvesters"
    );
    expect(dataTransfer.effectAllowed).toBe("move");
  });

  it("marks the dragged frame and the drop target, and clears the marks afterwards", async () => {
    const { frames } = await arrangeThree();

    fireEvent.dragStart(frames[0]);
    fireEvent.dragOver(frames[2]);
    expect(frames[0]).toHaveClass("is-dragging");
    expect(frames[2]).toHaveClass("is-drop-target");
    expect(frames[1]).not.toHaveClass("is-drop-target");

    fireEvent.drop(frames[2]);
    fireEvent.dragEnd(frames[0]);
    frames.forEach((frame) => {
      expect(frame).not.toHaveClass("is-dragging");
      expect(frame).not.toHaveClass("is-drop-target");
    });
  });

  it("clears the marks when a drag ends outside of any frame", async () => {
    const { frames, onMoveFavorite } = await arrangeThree();

    fireEvent.dragStart(frames[0]);
    fireEvent.dragOver(frames[1]);
    fireEvent.dragEnd(frames[0]);

    expect(onMoveFavorite).not.toHaveBeenCalled();
    frames.forEach((frame) => {
      expect(frame).not.toHaveClass("is-dragging");
      expect(frame).not.toHaveClass("is-drop-target");
    });
  });
});
