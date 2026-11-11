import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import GalleryPage from "./GalleryPage";

function piece(
  overrides: Partial<ArtPiece> & Pick<ArtPiece, "slug" | "name">
): ArtPiece {
  return {
    artist: "Unknown Artist",
    imageSource: `https://example.com/${overrides.slug}.jpg`,
    year: "1900",
    genre: "Other",
    colors: [],
    ...overrides,
  };
}

const artPieces: ArtPiece[] = [
  piece({
    slug: "the-harvesters",
    name: "The Harvesters",
    artist: "Pieter Bruegel the Elder",
    genre: "Renaissance",
  }),
  piece({
    slug: "wheat-field",
    name: "Wheat Field with Cypresses",
    artist: "Vincent van Gogh",
    genre: "Landscape Painting",
  }),
  piece({
    slug: "starry-night",
    name: "The Starry Night",
    artist: "Vincent van Gogh",
    genre: "Landscape Painting",
  }),
  piece({
    slug: "mona-lisa",
    name: "Mona Lisa",
    artist: "Leonardo da Vinci",
    genre: "Renaissance",
  }),
];

function renderGallery(
  isFavorite: (slug: string) => boolean = () => false,
  onToggleFavorite: (slug: string) => void = () => {}
) {
  render(
    <MemoryRouter>
      <GalleryPage
        artPieces={artPieces}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
    </MemoryRouter>
  );
}

function shownTitles() {
  return screen
    .queryAllByRole("heading", { level: 2 })
    .map((heading) => heading.textContent);
}

async function openFilters(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /^Filters/ }));
}

describe("GalleryPage", () => {
  it("shows every art piece at the start, with nothing searched and all genres selected", async () => {
    const user = userEvent.setup();
    renderGallery();
    await openFilters(user);

    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue("");
    expect(
      screen.getByRole("option", { name: "All genres", selected: true })
    ).toBeInTheDocument();
    expect(screen.queryByText("No art pieces found")).not.toBeInTheDocument();
  });

  it("builds the genre options from the art pieces, each genre once", async () => {
    const user = userEvent.setup();
    renderGallery();
    await openFilters(user);

    const options = within(
      screen.getByRole("combobox", { name: "Genre" })
    ).getAllByRole("option");

    expect(options.map((option) => option.textContent)).toEqual([
      "All genres",
      "Landscape Painting",
      "Renaissance",
    ]);
  });

  it("narrows the list while the user types", async () => {
    const user = userEvent.setup();
    renderGallery();
    const field = screen.getByRole("searchbox", { name: "Search" });

    await user.type(field, "v");
    expect(shownTitles()).toEqual([
      "The Harvesters",
      "Wheat Field with Cypresses",
      "The Starry Night",
      "Mona Lisa",
    ]);

    await user.type(field, "an");
    expect(shownTitles()).toEqual([
      "Wheat Field with Cypresses",
      "The Starry Night",
    ]);
  });

  it("finds pieces by artist, ignoring upper and lower case and outer spaces", async () => {
    const user = userEvent.setup();
    renderGallery();

    await user.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "  LEONARDO  "
    );

    expect(shownTitles()).toEqual(["Mona Lisa"]);
  });

  it("shows only the pieces of the selected genre and all of them again for All genres", async () => {
    const user = userEvent.setup();
    renderGallery();
    await openFilters(user);
    const genre = screen.getByRole("combobox", { name: "Genre" });

    await user.selectOptions(genre, "Landscape Painting");
    expect(shownTitles()).toEqual([
      "Wheat Field with Cypresses",
      "The Starry Night",
    ]);

    await user.selectOptions(genre, "All genres");
    expect(shownTitles()).toHaveLength(4);
  });

  it("shows only the pieces that match the search and the genre", async () => {
    const user = userEvent.setup();
    renderGallery();
    await openFilters(user);

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "the");
    expect(shownTitles()).toEqual(["The Harvesters", "The Starry Night"]);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Landscape Painting"
    );
    expect(shownTitles()).toEqual(["The Starry Night"]);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Renaissance"
    );
    expect(shownTitles()).toEqual(["The Harvesters"]);
  });

  it('shows "No art pieces found" and no list when nothing matches, and the list again after clearing', async () => {
    const user = userEvent.setup();
    renderGallery();
    const field = screen.getByRole("searchbox", { name: "Search" });

    await user.type(field, "nothing like this");

    expect(screen.getByText("No art pieces found")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();

    await user.clear(field);

    expect(screen.queryByText("No art pieces found")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it('shows "No art pieces found" when the search matches but not in the selected genre', async () => {
    const user = userEvent.setup();
    renderGallery();
    await openFilters(user);

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "mona");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Landscape Painting"
    );

    expect(screen.getByText("No art pieces found")).toBeInTheDocument();
  });

  it("keeps the favorite buttons working on the filtered pieces", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    renderGallery((slug) => slug === "mona-lisa", onToggleFavorite);

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "mona");
    const heart = screen.getByRole("button", { name: "Favorite Mona Lisa" });

    expect(heart).toHaveAttribute("aria-pressed", "true");

    await user.click(heart);

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledWith("mona-lisa");
  });
});

describe("GalleryPage color filter", () => {
  const coloredPieces: ArtPiece[] = [
    piece({
      slug: "the-harvesters",
      name: "The Harvesters",
      artist: "Pieter Bruegel the Elder",
      genre: "Renaissance",
      colors: ["#37412E", "#8D7332"],
    }),
    piece({
      slug: "wheat-field",
      name: "Wheat Field with Cypresses",
      artist: "Vincent van Gogh",
      genre: "Landscape Painting",
      colors: ["#718F98", "#9DA59E"],
    }),
    piece({
      slug: "starry-night",
      name: "The Starry Night",
      artist: "Vincent van Gogh",
      genre: "Landscape Painting",
      colors: ["#1E3F8A", "#F2D45C"],
    }),
    piece({
      slug: "mona-lisa",
      name: "Mona Lisa",
      artist: "Leonardo da Vinci",
      genre: "Renaissance",
      colors: ["#4A3728", "#A52A2A"],
    }),
  ];

  function renderColoredGallery() {
    render(
      <MemoryRouter>
        <GalleryPage
          artPieces={coloredPieces}
          isFavorite={() => false}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );
  }

  it("offers a checkbox for every color family of the palettes, none checked at the start", async () => {
    const user = userEvent.setup();
    renderColoredGallery();
    await openFilters(user);

    const group = screen.getByRole("group", { name: "Color" });
    const checkboxes = within(group).getAllByRole("checkbox");

    expect(
      checkboxes.map((checkbox) => checkbox.closest("label")?.textContent)
    ).toEqual(["Red", "Yellow", "Green", "Blue", "Brown", "Neutral"]);
    checkboxes.forEach((checkbox) => expect(checkbox).not.toBeChecked());
    expect(shownTitles()).toHaveLength(4);
  });

  it("shows no color group when the pieces have no colors", () => {
    renderGallery();

    expect(
      screen.queryByRole("group", { name: "Color" })
    ).not.toBeInTheDocument();
  });

  it("shows only the pieces that have a color of the selected family", async () => {
    const user = userEvent.setup();
    renderColoredGallery();
    await openFilters(user);

    await user.click(screen.getByRole("checkbox", { name: "Blue" }));

    expect(shownTitles()).toEqual([
      "Wheat Field with Cypresses",
      "The Starry Night",
    ]);
  });

  it("shows the pieces that have any of several selected colors", async () => {
    const user = userEvent.setup();
    renderColoredGallery();
    await openFilters(user);

    await user.click(screen.getByRole("checkbox", { name: "Blue" }));
    await user.click(screen.getByRole("checkbox", { name: "Red" }));

    expect(shownTitles()).toEqual([
      "Wheat Field with Cypresses",
      "The Starry Night",
      "Mona Lisa",
    ]);
  });

  it("shows all pieces again when every color is unselected", async () => {
    const user = userEvent.setup();
    renderColoredGallery();
    await openFilters(user);

    await user.click(screen.getByRole("checkbox", { name: "Blue" }));
    await user.click(screen.getByRole("checkbox", { name: "Blue" }));

    expect(shownTitles()).toHaveLength(4);
    expect(screen.getByRole("checkbox", { name: "Blue" })).not.toBeChecked();
  });

  it("works together with the search and the genre", async () => {
    const user = userEvent.setup();
    renderColoredGallery();
    await openFilters(user);

    await user.click(screen.getByRole("checkbox", { name: "Blue" }));
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "the");
    expect(shownTitles()).toEqual(["The Starry Night"]);

    await user.clear(screen.getByRole("searchbox", { name: "Search" }));
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Renaissance"
    );
    expect(screen.getByText("No art pieces found")).toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Landscape Painting"
    );
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "wheat");
    expect(shownTitles()).toEqual(["Wheat Field with Cypresses"]);
  });

  it('shows "No art pieces found" when no piece has the selected color together with the other filters', async () => {
    const user = userEvent.setup();
    renderColoredGallery();
    await openFilters(user);

    await user.click(screen.getByRole("checkbox", { name: "Green" }));
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Landscape Painting"
    );

    expect(screen.getByText("No art pieces found")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("keeps the Search field visible and hides Genre and Color at the start", () => {
    renderColoredGallery();

    expect(
      screen.getByRole("searchbox", { name: "Search" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Genre" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Color" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filters" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("shows Genre and Color when the Filters button is clicked and hides them when it is clicked again", async () => {
    const user = userEvent.setup();
    renderColoredGallery();
    const toggle = screen.getByRole("button", { name: "Filters" });

    await user.click(toggle);

    expect(screen.getByRole("combobox", { name: "Genre" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Color" })).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("searchbox", { name: "Search" })
    ).toBeInTheDocument();

    await user.click(toggle);

    expect(
      screen.queryByRole("combobox", { name: "Genre" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Color" })
    ).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("can be opened with the keyboard and keeps the focus on the button", async () => {
    const user = userEvent.setup();
    renderColoredGallery();

    await user.tab();
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveFocus();
    await user.tab();
    const toggle = screen.getByRole("button", { name: "Filters" });
    expect(toggle).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(screen.getByRole("group", { name: "Color" })).toBeInTheDocument();
    expect(toggle).toHaveFocus();
  });

  it("shows how many filters are active on the button", async () => {
    const user = userEvent.setup();
    renderColoredGallery();
    await user.click(screen.getByRole("button", { name: "Filters" }));

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Landscape Painting"
    );
    expect(
      screen.getByRole("button", { name: "Filters (1)" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Blue" }));
    expect(
      screen.getByRole("button", { name: "Filters (2)" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Red" }));
    expect(
      screen.getByRole("button", { name: "Filters (3)" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Red" }));
    expect(
      screen.getByRole("button", { name: "Filters (2)" })
    ).toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "All genres"
    );
    expect(
      screen.getByRole("button", { name: "Filters (1)" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Blue" }));
    expect(screen.getByRole("button", { name: "Filters" })).toBeInTheDocument();
  });

  it("does not count the search text as a filter and searches with the panel closed", async () => {
    const user = userEvent.setup();
    renderColoredGallery();

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "mona");

    expect(shownTitles()).toEqual(["Mona Lisa"]);
    expect(screen.getByRole("button", { name: "Filters" })).toBeInTheDocument();
  });

  it("keeps the filters applied when the panel is closed and shows the same choices when it is reopened", async () => {
    const user = userEvent.setup();
    renderColoredGallery();
    const toggle = screen.getByRole("button", { name: "Filters" });
    await user.click(toggle);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Landscape Painting"
    );
    await user.click(screen.getByRole("checkbox", { name: "Blue" }));
    const filteredTitles = shownTitles();

    await user.click(screen.getByRole("button", { name: "Filters (2)" }));

    expect(shownTitles()).toEqual(filteredTitles);
    expect(shownTitles()).toEqual([
      "Wheat Field with Cypresses",
      "The Starry Night",
    ]);
    expect(
      screen.getByRole("button", { name: "Filters (2)" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Filters (2)" }));

    expect(screen.getByRole("combobox", { name: "Genre" })).toHaveValue(
      "Landscape Painting"
    );
    expect(screen.getByRole("checkbox", { name: "Blue" })).toBeChecked();
  });

  it("has no Remove filters button when no filter is active", () => {
    renderColoredGallery();

    expect(
      screen.queryByRole("button", { name: "Remove filters" })
    ).not.toBeInTheDocument();
  });

  it("shows the Remove filters button while a search text, a genre or a color is active", async () => {
    const user = userEvent.setup();
    renderColoredGallery();
    const search = screen.getByRole("searchbox", { name: "Search" });

    await user.type(search, "mona");
    expect(
      screen.getByRole("button", { name: "Remove filters" })
    ).toBeInTheDocument();
    await user.clear(search);
    expect(
      screen.queryByRole("button", { name: "Remove filters" })
    ).not.toBeInTheDocument();

    await openFilters(user);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Renaissance"
    );
    expect(
      screen.getByRole("button", { name: "Remove filters" })
    ).toBeInTheDocument();
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "All genres"
    );
    expect(
      screen.queryByRole("button", { name: "Remove filters" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Blue" }));
    expect(
      screen.getByRole("button", { name: "Remove filters" })
    ).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Blue" }));
    expect(
      screen.queryByRole("button", { name: "Remove filters" })
    ).not.toBeInTheDocument();
  });

  it("does not count a search text with only spaces as an active filter", async () => {
    const user = userEvent.setup();
    renderColoredGallery();

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "   ");

    expect(
      screen.queryByRole("button", { name: "Remove filters" })
    ).not.toBeInTheDocument();
  });

  it("removes the search text, the genre and the colors and shows all pieces again", async () => {
    const user = userEvent.setup();
    renderColoredGallery();
    await openFilters(user);
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "the");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Landscape Painting"
    );
    await user.click(screen.getByRole("checkbox", { name: "Blue" }));
    await user.click(screen.getByRole("checkbox", { name: "Yellow" }));
    expect(shownTitles()).toEqual(["The Starry Night"]);

    await user.click(screen.getByRole("button", { name: "Remove filters" }));

    expect(shownTitles()).toHaveLength(4);
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue("");
    expect(
      screen.getByRole("option", { name: "All genres", selected: true })
    ).toBeInTheDocument();
    screen
      .getAllByRole("checkbox")
      .forEach((checkbox) => expect(checkbox).not.toBeChecked());
    expect(screen.getByRole("button", { name: "Filters" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove filters" })
    ).not.toBeInTheDocument();
  });

  it("leaves the filter panel open when it was open", async () => {
    const user = userEvent.setup();
    renderColoredGallery();
    await openFilters(user);
    await user.click(screen.getByRole("checkbox", { name: "Blue" }));

    await user.click(screen.getByRole("button", { name: "Remove filters" }));

    expect(screen.getByRole("group", { name: "Color" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filters" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("also works while the filter panel is closed and leaves it closed", async () => {
    const user = userEvent.setup();
    renderColoredGallery();
    await openFilters(user);
    await user.click(screen.getByRole("checkbox", { name: "Blue" }));
    await user.click(screen.getByRole("button", { name: "Filters (1)" }));
    expect(shownTitles()).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Remove filters" }));

    expect(shownTitles()).toHaveLength(4);
    expect(
      screen.queryByRole("group", { name: "Color" })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filters" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("moves the focus to the Search field after the filters were removed", async () => {
    const user = userEvent.setup();
    renderColoredGallery();
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "mona");

    await user.click(screen.getByRole("button", { name: "Remove filters" }));

    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveFocus();
  });
});

describe("GalleryPage: empty state", () => {
  function frame() {
    return document.querySelector(".empty-frame");
  }

  it("shows a decorative empty frame with a magnifier icon when nothing matches", async () => {
    const user = userEvent.setup();
    renderGallery();

    await user.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "nothing like this"
    );

    expect(frame()).toHaveAttribute("aria-hidden", "true");
    expect(frame()?.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByText("No art pieces found")).toBeInTheDocument();
  });

  it("keeps the single Remove filters button, which brings the pieces back", async () => {
    const user = userEvent.setup();
    renderGallery();
    await user.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "nothing like this"
    );

    await user.click(screen.getByRole("button", { name: "Remove filters" }));

    expect(frame()).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("shows no frame while pieces are listed", () => {
    renderGallery();

    expect(frame()).not.toBeInTheDocument();
  });
});

describe("GalleryPage: sorting", () => {
  // In the order of the API: Harvesters, Wheat Field, Starry Night, Mona Lisa.
  const sortable: ArtPiece[] = [
    piece({
      slug: "the-harvesters",
      name: "The Harvesters",
      artist: "Pieter Bruegel the Elder",
      year: "1565",
      genre: "Renaissance",
    }),
    piece({
      slug: "wheat-field",
      name: "Wheat Field with Cypresses",
      artist: "Vincent van Gogh",
      year: "1889",
      genre: "Landscape Painting",
    }),
    piece({
      slug: "starry-night",
      name: "The Starry Night",
      artist: "Vincent van Gogh",
      year: "1889",
      genre: "Landscape Painting",
    }),
    piece({
      slug: "mona-lisa",
      name: "Mona Lisa",
      artist: "Leonardo da Vinci",
      year: "1503–19",
      genre: "Renaissance",
    }),
  ];

  function renderSortable() {
    render(
      <MemoryRouter>
        <GalleryPage
          artPieces={sortable}
          isFavorite={() => false}
          onToggleFavorite={() => {}}
        />
      </MemoryRouter>
    );
  }

  function sortBy(user: ReturnType<typeof userEvent.setup>, label: string) {
    return user.selectOptions(
      screen.getByRole("combobox", { name: "Sort by" }),
      label
    );
  }

  it("shows the Sort by dropdown at the start, without opening the filters, on the default order", () => {
    renderSortable();

    expect(
      screen.getByRole("option", { name: "Default order", selected: true })
    ).toBeInTheDocument();
    expect(shownTitles()).toEqual([
      "The Harvesters",
      "Wheat Field with Cypresses",
      "The Starry Night",
      "Mona Lisa",
    ]);
  });

  it.each([
    [
      "Name (A–Z)",
      [
        "Mona Lisa",
        "The Harvesters",
        "The Starry Night",
        "Wheat Field with Cypresses",
      ],
    ],
    [
      "Artist (A–Z)",
      [
        "Mona Lisa",
        "The Harvesters",
        "Wheat Field with Cypresses",
        "The Starry Night",
      ],
    ],
    [
      "Year (oldest first)",
      [
        "Mona Lisa",
        "The Harvesters",
        "Wheat Field with Cypresses",
        "The Starry Night",
      ],
    ],
    [
      "Year (newest first)",
      [
        "Wheat Field with Cypresses",
        "The Starry Night",
        "The Harvesters",
        "Mona Lisa",
      ],
    ],
  ])("sorts by %s", async (label, expected) => {
    const user = userEvent.setup();
    renderSortable();

    await sortBy(user, label);

    expect(shownTitles()).toEqual(expected);
  });

  it("goes back to the default order", async () => {
    const user = userEvent.setup();
    renderSortable();
    await sortBy(user, "Name (A–Z)");

    await sortBy(user, "Default order");

    expect(shownTitles()[0]).toBe("The Harvesters");
  });

  it("sorts only the paintings that a search leaves", async () => {
    const user = userEvent.setup();
    renderSortable();

    await user.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "Vincent"
    );
    expect(shownTitles()).toEqual([
      "Wheat Field with Cypresses",
      "The Starry Night",
    ]);

    await sortBy(user, "Name (A–Z)");
    expect(shownTitles()).toEqual([
      "The Starry Night",
      "Wheat Field with Cypresses",
    ]);
  });

  it("sorts only the paintings that a genre leaves", async () => {
    const user = userEvent.setup();
    renderSortable();
    await openFilters(user);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Renaissance"
    );

    await sortBy(user, "Year (oldest first)");

    expect(shownTitles()).toEqual(["Mona Lisa", "The Harvesters"]);
  });

  it("keeps the chosen order when the filters are removed", async () => {
    const user = userEvent.setup();
    renderSortable();
    await user.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "Vincent"
    );
    await sortBy(user, "Name (A–Z)");

    await user.click(screen.getByRole("button", { name: "Remove filters" }));

    expect(shownTitles()).toEqual([
      "Mona Lisa",
      "The Harvesters",
      "The Starry Night",
      "Wheat Field with Cypresses",
    ]);
    expect(
      screen.getByRole("option", { name: "Name (A–Z)", selected: true })
    ).toBeInTheDocument();
  });

  it("does not count as a filter", async () => {
    const user = userEvent.setup();
    renderSortable();

    await sortBy(user, "Artist (A–Z)");

    expect(screen.getByRole("button", { name: "Filters" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Remove filters" })
    ).not.toBeInTheDocument();
  });
});
