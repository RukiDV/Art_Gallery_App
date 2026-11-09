import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { SWRConfig } from "swr";

import App from "./App";
import { mockRandomFraction } from "./mockRandom";
import { STORAGE_KEY } from "./storage";
import type { ArtPiece } from "./types";

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

function renderApp(route: string) {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </SWRConfig>
  );
}

function stubFetchWithArtPieces() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => artPieces })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

async function addComment(
  user: ReturnType<typeof userEvent.setup>,
  text: string
) {
  if (text !== "") {
    await user.type(
      screen.getByRole("textbox", { name: "Your comment" }),
      text
    );
  }
  await user.click(screen.getByRole("button", { name: "Add comment" }));
}

describe("App", () => {
  it("shows a loading message while the art pieces are being fetched", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {}))
    );

    renderApp("/art-pieces");

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("lists the art pieces on /art-pieces", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => artPieces })
    );

    renderApp("/art-pieces");

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
  });

  it("shows an error message when fetching fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    renderApp("/art-pieces");

    expect(await screen.findByText(/error|failed/i)).toBeInTheDocument();
  });

  it("shows the spotlight art piece on /", async () => {
    mockRandomFraction(0.99);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => artPieces })
    );

    renderApp("/");

    expect(
      await screen.findByRole("img", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();
    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("shows a loading message on /", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {}))
    );

    renderApp("/");

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it.each(["/", "/art-pieces"])(
    "shows the navigation exactly once on %s, even while loading",
    (route) => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() => new Promise(() => {}))
      );

      renderApp(route);

      expect(screen.getAllByRole("navigation")).toHaveLength(1);
    }
  );

  it("shows a not found message and the navigation on an unknown URL", async () => {
    stubFetchWithArtPieces();

    renderApp("/does-not-exist");

    expect(await screen.findByText("Page not found")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("shows the not found message on an unknown URL while the art pieces are loading", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {}))
    );

    renderApp("/does-not-exist");

    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it("shows the not found message on an unknown URL when fetching fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    renderApp("/does-not-exist");

    expect(await screen.findByText("Page not found")).toBeInTheDocument();
    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
  });

  it("shows the details of an art piece on /art-pieces/:slug", async () => {
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");

    expect(
      await screen.findByRole("heading", { name: "The Harvesters" })
    ).toBeInTheDocument();
    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
    expect(screen.getByText("1565")).toBeInTheDocument();
    expect(screen.getByText("Renaissance")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Wheat Field with Cypresses/ })
    ).not.toBeInTheDocument();
  });

  it('shows "Art piece not found" for an unknown slug', async () => {
    stubFetchWithArtPieces();

    renderApp("/art-pieces/does-not-exist");

    expect(await screen.findByText("Art piece not found")).toBeInTheDocument();
    expect(screen.queryByText("Page not found")).not.toBeInTheDocument();
  });

  it("opens the details after clicking an art piece in the gallery", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    await user.click(
      await screen.findByRole("link", { name: /Wheat Field with Cypresses/ })
    );

    expect(await screen.findByText("1889")).toBeInTheDocument();
    expect(screen.getByText("Landscape Painting")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /The Harvesters/ })
    ).not.toBeInTheDocument();
  });

  it("goes back to the gallery after clicking Back on the details page", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await user.click(await screen.findByRole("link", { name: "Back" }));

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
  });

  it('shows the Gallery page after clicking "Gallery"', async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/");
    await user.click(await screen.findByRole("link", { name: "Gallery" }));

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
  });

  it('shows the Spotlight page after clicking "Spotlight"', async () => {
    const user = userEvent.setup();
    mockRandomFraction(0.99);
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    await user.click(await screen.findByRole("link", { name: "Spotlight" }));

    expect(
      await screen.findByRole("img", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("marks an art piece as favorite and removes the mark with a second click", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    const harvesters = await screen.findByRole("button", {
      name: "Favorite The Harvesters",
    });
    const wheatField = screen.getByRole("button", {
      name: "Favorite Wheat Field with Cypresses",
    });

    await user.click(harvesters);
    expect(harvesters).toHaveAttribute("aria-pressed", "true");
    expect(wheatField).toHaveAttribute("aria-pressed", "false");

    await user.click(harvesters);
    expect(harvesters).toHaveAttribute("aria-pressed", "false");
  });

  it("only changes the art piece whose favorite button is clicked", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    const harvesters = await screen.findByRole("button", {
      name: "Favorite The Harvesters",
    });
    const wheatField = screen.getByRole("button", {
      name: "Favorite Wheat Field with Cypresses",
    });
    await user.click(harvesters);
    await user.click(wheatField);
    await user.click(harvesters);

    expect(harvesters).toHaveAttribute("aria-pressed", "false");
    expect(wheatField).toHaveAttribute("aria-pressed", "true");
  });

  it("shows a favorite from the gallery as a favorite on its details page", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    await user.click(screen.getByRole("link", { name: /The Harvesters/ }));

    expect(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("shows a favorite from the details page as a favorite in the gallery", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    await user.click(screen.getByRole("link", { name: "Back" }));

    expect(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps the spotlight art piece when it is marked as favorite", async () => {
    const user = userEvent.setup();
    const setRandomFraction = mockRandomFraction(0.99);
    stubFetchWithArtPieces();

    renderApp("/");
    const button = await screen.findByRole("button", {
      name: "Favorite Wheat Field with Cypresses",
    });
    setRandomFraction(0);
    await user.click(button);

    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.queryByText("Pieter Bruegel the Elder")
    ).not.toBeInTheDocument();
  });

  it('shows the Favorites page after clicking "Favorites"', async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/");
    await user.click(await screen.findByRole("link", { name: "Favorites" }));

    expect(await screen.findByText("No favorites yet")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("lists only the art pieces marked as favorite on /favorites", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    await user.click(screen.getByRole("link", { name: "Favorites" }));

    expect(await screen.findAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "The Harvesters" })
    ).toBeInTheDocument();
    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "The Harvesters" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("Vincent van Gogh")).not.toBeInTheDocument();
  });

  it("removes an art piece from /favorites when its favorite button is clicked", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    await user.click(screen.getByRole("link", { name: "Favorites" }));
    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );

    expect(await screen.findByText("No favorites yet")).toBeInTheDocument();
  });

  it("shows the Favorites page when /favorites is opened directly", async () => {
    stubFetchWithArtPieces();

    renderApp("/favorites");

    expect(await screen.findByText("No favorites yet")).toBeInTheDocument();
    expect(screen.queryByText("Page not found")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Favorites" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("shows a loading message on /favorites while fetching", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {}))
    );

    renderApp("/favorites");

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText("Page not found")).not.toBeInTheDocument();
  });

  it("adds a comment with its date and time on the details page", async () => {
    const user = userEvent.setup();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-09T10:15:00.000Z"));
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    await addComment(user, "What a beautiful sky!");

    expect(screen.getByText("What a beautiful sky!")).toBeInTheDocument();
    expect(
      screen.getByText(new Date("2026-11-09T10:15:00.000Z").toLocaleString())
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Your comment" })).toHaveValue(
      ""
    );
  });

  it("lists comments oldest first", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    await addComment(user, "first comment");
    await addComment(user, "second comment");

    const comments = screen
      .getAllByRole("listitem")
      .filter((item) => item.querySelector("time") !== null);

    expect(comments).toHaveLength(2);
    expect(comments[0]).toHaveTextContent("first comment");
    expect(comments[1]).toHaveTextContent("second comment");
  });

  it("keeps comments with the art piece they were written for", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    await addComment(user, "A comment for the harvesters");
    await user.click(screen.getByRole("link", { name: "Back" }));
    await user.click(
      await screen.findByRole("link", { name: /Wheat Field with Cypresses/ })
    );

    expect(
      await screen.findByRole("heading", { name: "Comments" })
    ).toBeInTheDocument();
    expect(
      screen.queryByText("A comment for the harvesters")
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Back" }));
    await user.click(
      await screen.findByRole("link", { name: /The Harvesters/ })
    );

    expect(
      await screen.findByText("A comment for the harvesters")
    ).toBeInTheDocument();
  });

  it("does not add an empty comment or a comment with only spaces", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    const itemsBefore = screen.queryAllByRole("listitem").length;
    await addComment(user, "");
    await addComment(user, "   ");

    expect(screen.queryAllByRole("listitem")).toHaveLength(itemsBefore);
  });

  it("shows the color palette of the art piece on its details page", async () => {
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");

    const palette = await screen.findByRole("list", { name: "Color palette" });
    expect(within(palette).getAllByRole("listitem")).toHaveLength(2);
    expect(within(palette).getByTitle("#37412E")).toBeInTheDocument();
    expect(within(palette).getByTitle("#8D7332")).toBeInTheDocument();
  });

  it("keeps the favorite status when a comment is added", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    await addComment(user, "Nice!");

    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Nice!")).toBeInTheDocument();
  });

  it("keeps a comment when the art piece is marked as favorite afterwards", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    await addComment(user, "Nice!");
    await user.click(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    );

    expect(screen.getByText("Nice!")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps a favorite after the app is reloaded", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    const firstVisit = renderApp("/art-pieces");
    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    firstVisit.unmount();

    renderApp("/art-pieces");

    expect(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps a comment after the app is reloaded", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    const firstVisit = renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    await addComment(user, "Still here after a reload");
    firstVisit.unmount();

    renderApp("/art-pieces/the-harvesters");

    expect(
      await screen.findByText("Still here after a reload")
    ).toBeInTheDocument();
  });

  it("lists a favorite on /favorites after the app is reloaded", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    const firstVisit = renderApp("/art-pieces");
    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    firstVisit.unmount();

    renderApp("/favorites");

    expect(await screen.findAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "The Harvesters" })
    ).toBeInTheDocument();
  });

  it("keeps the removal of a favorite after the app is reloaded", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    const firstVisit = renderApp("/art-pieces");
    const button = await screen.findByRole("button", {
      name: "Favorite The Harvesters",
    });
    await user.click(button);
    await user.click(button);
    firstVisit.unmount();

    renderApp("/art-pieces");

    expect(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("works without any stored data", async () => {
    stubFetchWithArtPieces();

    renderApp("/art-pieces");

    const buttons = await screen.findAllByRole("button");
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) =>
      expect(button).toHaveAttribute("aria-pressed", "false")
    );
  });

  it("ignores broken entries in the stored data and keeps the valid ones", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        null,
        1,
        {
          slug: "the-harvesters",
          isFavorite: true,
          comments: [
            {
              text: "Saved before the reload",
              date: "2026-11-09T10:15:00.000Z",
            },
          ],
        },
        { slug: "wheat-field-with-cypresses", isFavorite: "yes", comments: [] },
      ])
    );
    stubFetchWithArtPieces();

    renderApp("/art-pieces");

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("link", { name: /The Harvesters/ }));

    expect(
      await screen.findByText("Saved before the reload")
    ).toBeInTheDocument();
  });

  it("works when the stored data is broken", async () => {
    localStorage.setItem(STORAGE_KEY, "{this is not json");
    stubFetchWithArtPieces();

    renderApp("/art-pieces");

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
  });
});
