import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { SWRConfig } from "swr";

import App from "./App";
import { mockColorScheme } from "./mockColorScheme";
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

type FetchOutcome = "fails" | "works" | "never finishes";

const fetchResponses: Record<FetchOutcome, () => Promise<unknown>> = {
  fails: () => Promise.resolve({ ok: false, status: 500 }),
  works: () => Promise.resolve({ ok: true, json: async () => artPieces }),
  "never finishes": () => new Promise(() => {}),
};

// One outcome per call of fetch, in order; the last outcome is repeated.
function stubFetchWithOutcomes(...outcomes: FetchOutcome[]) {
  const fetchMock = vi.fn();
  outcomes.forEach((outcome, index) => {
    const response = fetchResponses[outcome]();
    if (index < outcomes.length - 1) {
      fetchMock.mockReturnValueOnce(response);
    } else {
      fetchMock.mockReturnValue(response);
    }
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
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

async function openFilters(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole("button", { name: /^Filters/ }));
}

async function startEditingComment(
  user: ReturnType<typeof userEvent.setup>,
  commentText: string,
  newText: string
) {
  await user.click(
    screen.getByRole("button", { name: `Edit comment: ${commentText}` })
  );
  const field = screen.getByRole("textbox", { name: /^Edit your comment/ });
  await user.clear(field);
  if (newText !== "") {
    await user.type(field, newText);
  }
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
    await user.click(screen.getByRole("link", { name: /^Favorites/ }));

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
    await user.click(screen.getByRole("link", { name: /^Favorites/ }));
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

  it("deletes only the clicked comment when two comments have the same text", async () => {
    const user = userEvent.setup();
    vi.useFakeTimers({ toFake: ["Date"] });
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    vi.setSystemTime(new Date("2026-11-09T10:15:00.000Z"));
    await addComment(user, "Nice!");
    vi.setSystemTime(new Date("2026-11-09T10:16:00.000Z"));
    await addComment(user, "Nice!");

    await user.click(screen.getAllByRole("button", { name: /^Delete/ })[1]);

    expect(screen.getAllByText("Nice!")).toHaveLength(1);
    expect(
      screen.getByText(new Date("2026-11-09T10:15:00.000Z").toLocaleString())
    ).toBeInTheDocument();
    expect(
      screen.queryByText(new Date("2026-11-09T10:16:00.000Z").toLocaleString())
    ).not.toBeInTheDocument();
  });

  it("does not change the comments of other art pieces when a comment is deleted", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          slug: "the-harvesters",
          isFavorite: false,
          comments: [
            {
              id: "a",
              text: "Harvesters comment",
              date: "2026-11-09T10:15:00.000Z",
            },
          ],
        },
        {
          slug: "wheat-field-with-cypresses",
          isFavorite: false,
          comments: [
            {
              id: "b",
              text: "Wheat field comment",
              date: "2026-11-09T10:16:00.000Z",
            },
          ],
        },
      ])
    );
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await user.click(
      await screen.findByRole("button", {
        name: "Delete comment: Harvesters comment",
      })
    );
    await user.click(screen.getByRole("link", { name: "Back" }));
    await user.click(
      await screen.findByRole("link", { name: /Wheat Field with Cypresses/ })
    );

    expect(await screen.findByText("Wheat field comment")).toBeInTheDocument();
  });

  it("keeps the Comments section and the form working after the last comment is deleted", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    await addComment(user, "The only comment");
    await user.click(
      screen.getByRole("button", { name: "Delete comment: The only comment" })
    );

    expect(screen.queryByText("The only comment")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Comments" })
    ).toBeInTheDocument();

    await addComment(user, "A new comment");

    expect(screen.getByText("A new comment")).toBeInTheDocument();
  });

  it("keeps a comment deleted after the app is reloaded", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    const firstVisit = renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    await addComment(user, "Gone after a reload");
    await addComment(user, "Still here after a reload");
    await user.click(
      screen.getByRole("button", {
        name: "Delete comment: Gone after a reload",
      })
    );
    firstVisit.unmount();

    renderApp("/art-pieces/the-harvesters");

    expect(
      await screen.findByText("Still here after a reload")
    ).toBeInTheDocument();
    expect(screen.queryByText("Gone after a reload")).not.toBeInTheDocument();
  });

  it("shows and can delete a comment that was saved without an id", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          slug: "the-harvesters",
          isFavorite: true,
          comments: [
            {
              text: "Saved before ids existed",
              date: "2026-11-09T10:15:00.000Z",
            },
          ],
        },
      ])
    );
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");

    expect(
      await screen.findByText("Saved before ids existed")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(
      screen.getByRole("button", {
        name: "Delete comment: Saved before ids existed",
      })
    );

    expect(
      screen.queryByText("Saved before ids existed")
    ).not.toBeInTheDocument();
  });

  it("changes only the edited comment when two comments have the same text", async () => {
    const user = userEvent.setup();
    vi.useFakeTimers({ toFake: ["Date"] });
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    vi.setSystemTime(new Date("2026-11-09T10:15:00.000Z"));
    await addComment(user, "Nice!");
    vi.setSystemTime(new Date("2026-11-09T10:16:00.000Z"));
    await addComment(user, "Nice!");

    await user.click(
      screen.getAllByRole("button", { name: "Edit comment: Nice!" })[1]
    );
    const field = screen.getByRole("textbox", { name: /^Edit your comment/ });
    await user.clear(field);
    await user.type(field, "Nice, really!");
    await user.click(screen.getByRole("button", { name: "Save" }));

    const items = screen
      .getAllByRole("listitem")
      .filter((item) => item.querySelector("time") !== null);
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Nice!");
    expect(items[0]).not.toHaveTextContent("edited");
    expect(items[1]).toHaveTextContent("Nice, really!");
    expect(items[1]).toHaveTextContent("edited");
  });

  it("keeps the original date and time of an edited comment", async () => {
    const user = userEvent.setup();
    vi.useFakeTimers({ toFake: ["Date"] });
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    vi.setSystemTime(new Date("2026-11-09T10:15:00.000Z"));
    await addComment(user, "A typo here");
    vi.setSystemTime(new Date("2026-11-09T18:45:00.000Z"));

    await startEditingComment(user, "A typo here", "No typo here");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("No typo here")).toBeInTheDocument();
    expect(screen.getByText("edited")).toBeInTheDocument();
    expect(
      screen.getByText(new Date("2026-11-09T10:15:00.000Z").toLocaleString())
    ).toBeInTheDocument();
    expect(
      screen.queryByText(new Date("2026-11-09T18:45:00.000Z").toLocaleString())
    ).not.toBeInTheDocument();
  });

  it("keeps the old text and shows no edited label after Cancel", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    await addComment(user, "Keep me");

    await startEditingComment(user, "Keep me", "Changed my mind");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Keep me")).toBeInTheDocument();
    expect(screen.queryByText("Changed my mind")).not.toBeInTheDocument();
    expect(screen.queryByText("edited")).not.toBeInTheDocument();
  });

  it("does not save an empty text for an edited comment", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    await addComment(user, "Not empty");

    await startEditingComment(user, "Not empty", "");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByRole("textbox", { name: /^Edit your comment/ })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Not empty")).toBeInTheDocument();
    expect(screen.queryByText("edited")).not.toBeInTheDocument();
  });

  it("does not mark a comment as edited when Save does not change the text", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    await addComment(user, "Same text");

    await startEditingComment(user, "Same text", "  Same text  ");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("Same text")).toBeInTheDocument();
    expect(screen.queryByText("edited")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: /^Edit your comment/ })
    ).not.toBeInTheDocument();
  });

  it("keeps an edited comment and its label after the app is reloaded", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    const firstVisit = renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    await addComment(user, "Before the edit");
    await startEditingComment(user, "Before the edit", "After the edit");
    await user.click(screen.getByRole("button", { name: "Save" }));
    firstVisit.unmount();

    renderApp("/art-pieces/the-harvesters");

    expect(await screen.findByText("After the edit")).toBeInTheDocument();
    expect(screen.queryByText("Before the edit")).not.toBeInTheDocument();
    expect(screen.getByText("edited")).toBeInTheDocument();
  });

  it("keeps the old text and the time of the edit as an earlier version", async () => {
    const user = userEvent.setup();
    vi.useFakeTimers({ toFake: ["Date"] });
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    vi.setSystemTime(new Date("2026-11-09T10:15:00.000Z"));
    await addComment(user, "First text");
    vi.setSystemTime(new Date("2026-11-09T18:45:00.000Z"));
    await startEditingComment(user, "First text", "Second text");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.click(screen.getByRole("button", { name: "edited" }));

    const list = screen.getByRole("list", { name: "Earlier versions" });
    expect(within(list).getByText("First text")).toBeInTheDocument();
    expect(
      within(list).getByText(
        new Date("2026-11-09T18:45:00.000Z").toLocaleString()
      )
    ).toBeInTheDocument();
    expect(within(list).queryByText("Second text")).not.toBeInTheDocument();
    expect(screen.getByText("Second text")).toBeInTheDocument();
  });

  it("adds one earlier version per saved edit, oldest first", async () => {
    const user = userEvent.setup();
    vi.useFakeTimers({ toFake: ["Date"] });
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    vi.setSystemTime(new Date("2026-11-09T10:15:00.000Z"));
    await addComment(user, "v1");
    vi.setSystemTime(new Date("2026-11-09T12:00:00.000Z"));
    await startEditingComment(user, "v1", "v2");
    await user.click(screen.getByRole("button", { name: "Save" }));
    vi.setSystemTime(new Date("2026-11-09T13:00:00.000Z"));
    await startEditingComment(user, "v2", "v3");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.click(screen.getByRole("button", { name: "edited" }));

    const items = within(
      screen.getByRole("list", { name: "Earlier versions" })
    ).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("v1");
    expect(items[0]).toHaveTextContent(
      new Date("2026-11-09T12:00:00.000Z").toLocaleString()
    );
    expect(items[1]).toHaveTextContent("v2");
    expect(items[1]).toHaveTextContent(
      new Date("2026-11-09T13:00:00.000Z").toLocaleString()
    );
  });

  it("adds no earlier version for Cancel, an empty text or a Save without changes", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    await addComment(user, "Original");
    await startEditingComment(user, "Original", "Changed");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await startEditingComment(user, "Changed", "Not saved");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await startEditingComment(user, "Changed", "");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await startEditingComment(user, "Changed", "Changed");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.click(screen.getByRole("button", { name: "edited" }));

    const items = within(
      screen.getByRole("list", { name: "Earlier versions" })
    ).getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent("Original");
  });

  it("keeps the earlier versions after the app is reloaded", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    const firstVisit = renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    await addComment(user, "Before the edit");
    await startEditingComment(user, "Before the edit", "After the edit");
    await user.click(screen.getByRole("button", { name: "Save" }));
    firstVisit.unmount();

    renderApp("/art-pieces/the-harvesters");
    await user.click(await screen.findByRole("button", { name: "edited" }));

    expect(
      within(screen.getByRole("list", { name: "Earlier versions" })).getByText(
        "Before the edit"
      )
    ).toBeInTheDocument();
  });

  it("opens the history of a comment that was edited before the history existed", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          slug: "the-harvesters",
          isFavorite: false,
          comments: [
            {
              id: "old",
              text: "Edited long ago",
              date: "2026-11-09T10:15:00.000Z",
              edited: true,
            },
          ],
        },
      ])
    );
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await user.click(await screen.findByRole("button", { name: "edited" }));

    expect(screen.getByText("No earlier versions saved")).toBeInTheDocument();
  });

  it("deletes the earlier versions with their comment and leaves other comments alone", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });
    await addComment(user, "First comment");
    await addComment(user, "Second comment");
    await startEditingComment(user, "First comment", "First, changed");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await startEditingComment(user, "Second comment", "Second, changed");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await user.click(
      screen.getByRole("button", { name: "Delete comment: First, changed" })
    );
    await user.click(screen.getByRole("button", { name: "edited" }));

    expect(screen.queryByText("First comment")).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("list", { name: "Earlier versions" })).getByText(
        "Second comment"
      )
    ).toBeInTheDocument();
  });

  it("shows the number of favorites in the navigation and updates it right away", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    const harvesters = await screen.findByRole("button", {
      name: "Favorite The Harvesters",
    });
    const wheatField = screen.getByRole("button", {
      name: "Favorite Wheat Field with Cypresses",
    });
    expect(screen.getByRole("link", { name: "Favorites" })).toBeInTheDocument();

    await user.click(harvesters);
    expect(
      screen.getByRole("link", { name: "Favorites (1)" })
    ).toBeInTheDocument();

    await user.click(wheatField);
    expect(
      screen.getByRole("link", { name: "Favorites (2)" })
    ).toBeInTheDocument();

    await user.click(harvesters);
    expect(
      screen.getByRole("link", { name: "Favorites (1)" })
    ).toBeInTheDocument();

    await user.click(wheatField);
    expect(screen.getByRole("link", { name: "Favorites" })).toBeInTheDocument();
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });

  it("updates the number when a favorite is added or removed on the details and the spotlight page", async () => {
    const user = userEvent.setup();
    mockRandomFraction(0.99);
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    expect(
      screen.getByRole("link", { name: "Favorites (1)" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Spotlight" }));
    await user.click(
      await screen.findByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    );
    expect(
      screen.getByRole("link", { name: "Favorites (2)" })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    );
    expect(
      screen.getByRole("link", { name: "Favorites (1)" })
    ).toBeInTheDocument();
  });

  it("keeps the number of favorites after the app is reloaded", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    const firstVisit = renderApp("/art-pieces");
    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    firstVisit.unmount();

    renderApp("/art-pieces");

    expect(
      await screen.findByRole("link", { name: "Favorites (1)" })
    ).toBeInTheDocument();
  });

  it("shows the number of favorites while the art pieces are still loading", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { slug: "the-harvesters", isFavorite: true, comments: [] },
        { slug: "wheat-field-with-cypresses", isFavorite: true, comments: [] },
      ])
    );
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {}))
    );

    renderApp("/art-pieces");

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Favorites (2)" })
    ).toBeInTheDocument();
  });

  it("does not count pieces that are not favorites", async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          slug: "the-harvesters",
          isFavorite: false,
          comments: [
            {
              id: "c1",
              text: "Only a comment",
              date: "2026-11-09T10:15:00.000Z",
            },
          ],
        },
        { slug: "wheat-field-with-cypresses", isFavorite: true, comments: [] },
      ])
    );
    stubFetchWithArtPieces();

    renderApp("/art-pieces/the-harvesters");
    await screen.findByRole("heading", { name: "Comments" });

    expect(
      screen.getByRole("link", { name: "Favorites (1)" })
    ).toBeInTheDocument();

    await addComment(user, "Another comment");

    expect(
      screen.getByRole("link", { name: "Favorites (1)" })
    ).toBeInTheDocument();
  });

  it("has a search field and a genre control on the Gallery page", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");

    expect(
      await screen.findByRole("searchbox", { name: "Search" })
    ).toBeInTheDocument();
    await openFilters(user);
    expect(screen.getByRole("combobox", { name: "Genre" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("narrows the Gallery by the search text and by the genre", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    await user.type(
      await screen.findByRole("searchbox", { name: "Search" }),
      "  VAN gogh "
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();

    await openFilters(user);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Renaissance"
    );

    expect(screen.getByText("No art pieces found")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("still lets the user mark a filtered piece as favorite", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    await user.type(
      await screen.findByRole("searchbox", { name: "Search" }),
      "harvest"
    );
    await user.click(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    );

    expect(
      screen.getByRole("link", { name: "Favorites (1)" })
    ).toBeInTheDocument();
  });

  it.each(["/", "/favorites"])(
    "has no search field and no genre control on %s",
    async (route) => {
      stubFetchWithArtPieces();

      renderApp(route);
      await waitFor(() =>
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      );

      expect(
        screen.queryByRole("searchbox", { name: "Search" })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("combobox", { name: "Genre" })
      ).not.toBeInTheDocument();
    }
  );

  it("does not change what the Favorites page lists when the Gallery was filtered", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    await user.click(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    );
    await user.type(
      screen.getByRole("searchbox", { name: "Search" }),
      "harvest"
    );
    await user.click(screen.getByRole("link", { name: /^Favorites/ }));

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
  });

  it("offers the color families of the paintings on the Gallery page", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    await openFilters(user);

    const group = await screen.findByRole("group", { name: "Color" });
    expect(
      within(group)
        .getAllByRole("checkbox")
        .map((checkbox) => checkbox.closest("label")?.textContent)
    ).toEqual(["Green", "Blue", "Brown", "Neutral"]);
  });

  it("shows the paintings that have the clicked color, and the ones with any of several colors", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    await openFilters(user);
    await user.click(await screen.findByRole("checkbox", { name: "Blue" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Green" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(2);

    await user.click(screen.getByRole("checkbox", { name: "Green" }));
    await user.click(screen.getByRole("checkbox", { name: "Blue" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("combines the color with the search on the Gallery page", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    await openFilters(user);
    await user.click(await screen.findByRole("checkbox", { name: "Brown" }));
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "wheat");

    expect(screen.getByText("No art pieces found")).toBeInTheDocument();
  });

  it.each(["/", "/favorites"])("has no color filter on %s", async (route) => {
    stubFetchWithArtPieces();

    renderApp(route);
    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );

    expect(
      screen.queryByRole("group", { name: "Color" })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("does not change what the Favorites page lists when a color was selected in the Gallery", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    await user.click(
      await screen.findByRole("button", { name: "Favorite The Harvesters" })
    );
    await user.click(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    );
    await openFilters(user);
    await user.click(screen.getByRole("checkbox", { name: "Blue" }));
    await user.click(screen.getByRole("link", { name: /^Favorites/ }));

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
  });

  it("shows the Search field and a Filters button on the Gallery page, with Genre and Color hidden at the start", async () => {
    stubFetchWithArtPieces();

    renderApp("/art-pieces");

    expect(
      await screen.findByRole("searchbox", { name: "Search" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filters" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(
      screen.queryByRole("combobox", { name: "Genre" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Color" })
    ).not.toBeInTheDocument();
  });

  it("keeps the Gallery filtered and shows the number of filters when the panel is closed", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    await openFilters(user);
    await user.click(screen.getByRole("checkbox", { name: "Blue" }));
    await user.click(screen.getByRole("button", { name: "Filters (1)" }));

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Filters (1)" })
    ).toBeInTheDocument();
  });

  it.each(["/", "/favorites"])("has no Filters button on %s", async (route) => {
    stubFetchWithArtPieces();

    renderApp(route);
    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );

    expect(
      screen.queryByRole("button", { name: /^Filters/ })
    ).not.toBeInTheDocument();
  });

  it("shows a Remove filters button on the Gallery page only while a filter is active, and the button brings back all paintings", async () => {
    const user = userEvent.setup();
    stubFetchWithArtPieces();

    renderApp("/art-pieces");
    const search = await screen.findByRole("searchbox", { name: "Search" });
    expect(
      screen.queryByRole("button", { name: "Remove filters" })
    ).not.toBeInTheDocument();

    await user.type(search, "harvest");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Remove filters" }));

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(search).toHaveValue("");
    expect(search).toHaveFocus();
    expect(
      screen.queryByRole("button", { name: "Remove filters" })
    ).not.toBeInTheDocument();
  });

  it.each(["/", "/favorites"])(
    "has no Remove filters button on %s",
    async (route) => {
      stubFetchWithArtPieces();

      renderApp(route);
      await waitFor(() =>
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      );

      expect(
        screen.queryByRole("button", { name: "Remove filters" })
      ).not.toBeInTheDocument();
    }
  );

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

    const buttons = await screen.findAllByRole("button", {
      name: /^Favorite /,
    });
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

  it('shows a "Try again" button together with the error message', async () => {
    stubFetchWithOutcomes("fails");

    renderApp("/art-pieces");

    expect(await screen.findByText(/failed/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" })
    ).toBeInTheDocument();
  });

  it.each(["/", "/art-pieces", "/art-pieces/the-harvesters", "/favorites"])(
    "shows the Try again button on %s when the art pieces cannot be loaded",
    async (route) => {
      stubFetchWithOutcomes("fails");

      renderApp(route);

      expect(
        await screen.findByRole("button", { name: "Try again" })
      ).toBeInTheDocument();
    }
  );

  it("loads the art pieces again and shows the loading message while it loads", async () => {
    const user = userEvent.setup();
    const fetchMock = stubFetchWithOutcomes("fails", "never finishes");

    renderApp("/art-pieces");
    await user.click(await screen.findByRole("button", { name: "Try again" }));

    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Try again" })
    ).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shows the art pieces and no error or button when the second try works", async () => {
    const user = userEvent.setup();
    stubFetchWithOutcomes("fails", "works");

    renderApp("/art-pieces");
    await user.click(await screen.findByRole("button", { name: "Try again" }));

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Try again" })
    ).not.toBeInTheDocument();
  });

  it("shows the error message and the button again when the second try fails too, and a third try can work", async () => {
    const user = userEvent.setup();
    let finishSecondTry: (response: unknown) => void = () => {};
    const secondTry = new Promise((resolve) => {
      finishSecondTry = resolve;
    });
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(fetchResponses.fails())
      .mockReturnValueOnce(secondTry)
      .mockReturnValue(fetchResponses.works());
    vi.stubGlobal("fetch", fetchMock);

    renderApp("/art-pieces");
    await user.click(await screen.findByRole("button", { name: "Try again" }));
    expect(await screen.findByText(/loading/i)).toBeInTheDocument();

    finishSecondTry({ ok: false, status: 500 });

    expect(await screen.findByText(/failed/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" })
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("works the same way on a details page", async () => {
    const user = userEvent.setup();
    stubFetchWithOutcomes("fails", "works");

    renderApp("/art-pieces/the-harvesters");
    await user.click(await screen.findByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("heading", { name: "The Harvesters" })
    ).toBeInTheDocument();
  });

  it("shows no Try again button when the art pieces were loaded", async () => {
    stubFetchWithOutcomes("works");

    renderApp("/art-pieces");

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(
      screen.queryByRole("button", { name: "Try again" })
    ).not.toBeInTheDocument();
  });

  it("shows no Try again button on an unknown URL, and keeps the navigation, when the art pieces cannot be loaded", async () => {
    stubFetchWithOutcomes("fails");

    renderApp("/does-not-exist");

    expect(await screen.findByText("Page not found")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Try again" })
    ).not.toBeInTheDocument();
  });
});

describe("App: Show another", () => {
  it("shows a Show another button on / that changes the spotlight piece", async () => {
    const user = userEvent.setup();
    mockRandomFraction(0);
    stubFetchWithArtPieces();

    renderApp("/");
    expect(
      await screen.findByRole("img", { name: "The Harvesters" })
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show another" }));

    expect(
      screen.getByRole("img", { name: "Wheat Field with Cypresses" })
    ).toBeInTheDocument();
    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "The Harvesters" })).toBeNull();
  });

  it("keeps the piece and counts the favorite when it is marked after Show another", async () => {
    const user = userEvent.setup();
    const setRandomFraction = mockRandomFraction(0);
    stubFetchWithArtPieces();

    renderApp("/");
    await user.click(
      await screen.findByRole("button", { name: "Show another" })
    );
    setRandomFraction(0);
    await user.click(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    );

    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("img", { name: "The Harvesters" })).toBeNull();
    expect(
      screen.getByRole("link", { name: "Favorites (1)" })
    ).toBeInTheDocument();
  });

  it.each(["/art-pieces", "/favorites"])(
    "has no Show another button on %s",
    async (route) => {
      stubFetchWithArtPieces();

      renderApp(route);
      await screen.findByRole("link", { name: "Spotlight" });
      await waitFor(() =>
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      );

      expect(
        screen.queryByRole("button", { name: "Show another" })
      ).not.toBeInTheDocument();
    }
  );
});

describe("App: slideshow", () => {
  it("has a Start slideshow button on /", async () => {
    stubFetchWithArtPieces();
    renderApp("/");
    expect(
      await screen.findByRole("button", { name: "Start slideshow" })
    ).toBeInTheDocument();
  });

  it.each(["/art-pieces", "/favorites"])(
    "has no slideshow button on %s",
    async (route) => {
      stubFetchWithArtPieces();

      renderApp(route);
      await screen.findByRole("link", { name: "Spotlight" });
      await waitFor(() =>
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      );

      expect(
        screen.queryByRole("button", { name: /slideshow/ })
      ).not.toBeInTheDocument();
    }
  );

  it("stops the slideshow when the Spotlight page is left", async () => {
    const user = userEvent.setup();
    mockRandomFraction(0);
    stubFetchWithArtPieces();
    renderApp("/");
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    await user.click(
      await screen.findByRole("button", { name: "Start slideshow" })
    );
    expect(vi.getTimerCount()).toBe(1);

    await user.click(screen.getByRole("link", { name: "Gallery" }));

    expect(vi.getTimerCount()).toBe(0);
    expect(
      screen.queryByRole("button", { name: /slideshow/ })
    ).not.toBeInTheDocument();
  });
});

describe("App: dark mode", () => {
  it.each([
    "/",
    "/art-pieces",
    "/favorites",
    "/art-pieces/the-harvesters",
    "/unknown",
  ])("has the theme button on %s", async (route) => {
    mockColorScheme("light");
    stubFetchWithArtPieces();

    renderApp(route);

    expect(
      await screen.findByRole("button", { name: "Switch to dark mode" })
    ).toBeInTheDocument();
  });

  it("keeps the dark mode on every page after switching", async () => {
    const user = userEvent.setup();
    mockColorScheme("light");
    stubFetchWithArtPieces();
    renderApp("/");

    await user.click(
      await screen.findByRole("button", { name: "Switch to dark mode" })
    );
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");

    for (const link of ["Gallery", "Favorites", "Spotlight"]) {
      await user.click(screen.getByRole("link", { name: new RegExp(link) }));

      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
      expect(
        screen.getByRole("button", { name: "Switch to light mode" })
      ).toBeInTheDocument();
    }
  });

  it("keeps the choice after the app is reloaded", async () => {
    const user = userEvent.setup();
    mockColorScheme("light");
    stubFetchWithArtPieces();
    const { unmount } = renderApp("/");
    await user.click(
      await screen.findByRole("button", { name: "Switch to dark mode" })
    );
    unmount();
    delete document.documentElement.dataset.theme;

    renderApp("/");

    expect(
      await screen.findByRole("button", { name: "Switch to light mode" })
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("does not change the saved art pieces data", async () => {
    const user = userEvent.setup();
    mockColorScheme("light");
    stubFetchWithArtPieces();
    renderApp("/");
    const before = localStorage.getItem(STORAGE_KEY);

    await user.click(
      await screen.findByRole("button", { name: "Switch to dark mode" })
    );

    expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
  });
});

describe("App: header", () => {
  it("has a banner with the heading Art Gallery on every page", async () => {
    stubFetchWithArtPieces();

    renderApp("/art-pieces");

    expect(
      within(screen.getByRole("banner")).getByRole("heading", {
        level: 1,
        name: "Art Gallery",
      })
    ).toBeInTheDocument();
    await screen.findByRole("link", { name: "Spotlight" });
  });
});

describe("App: status pages with an empty frame", () => {
  function frameOf(container: HTMLElement) {
    return container.querySelector(".empty-frame");
  }

  it("shows a decorative empty frame and ways back on an unknown URL", async () => {
    stubFetchWithArtPieces();

    const { container } = renderApp("/does-not-exist");

    expect(await screen.findByText("Page not found")).toBeInTheDocument();
    expect(frameOf(container)).toHaveAttribute("aria-hidden", "true");
    expect(frameOf(container)).toHaveTextContent("404");
    expect(
      screen.getByRole("link", { name: "Back to the Spotlight" })
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: "Browse the gallery" })
    ).toHaveAttribute("href", "/art-pieces");
  });

  it("goes to the Spotlight with the link on an unknown URL", async () => {
    stubFetchWithArtPieces();
    const user = userEvent.setup();
    renderApp("/does-not-exist");

    await user.click(
      await screen.findByRole("link", { name: "Back to the Spotlight" })
    );

    expect(await screen.findByRole("figure")).toBeInTheDocument();
    expect(screen.queryByText("Page not found")).not.toBeInTheDocument();
  });

  it("shows a decorative empty frame and a way back for an unknown art piece", async () => {
    stubFetchWithArtPieces();

    const { container } = renderApp("/art-pieces/does-not-exist");

    expect(await screen.findByText("Art piece not found")).toBeInTheDocument();
    expect(frameOf(container)).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.getByRole("link", { name: "Back to the gallery" })
    ).toHaveAttribute("href", "/art-pieces");
  });

  it("shows a decorative empty frame while loading", () => {
    stubFetchWithOutcomes("never finishes");

    const { container } = renderApp("/");

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(frameOf(container)).toHaveAttribute("aria-hidden", "true");
  });

  it("shows a decorative empty frame with the error message and Try again", async () => {
    stubFetchWithOutcomes("fails");

    const { container } = renderApp("/");

    expect(await screen.findByText(/failed/i)).toBeInTheDocument();
    expect(frameOf(container)).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.getByRole("button", { name: "Try again" })
    ).toBeInTheDocument();
  });
});

describe("App: order of the favorites", () => {
  function favoriteNames() {
    return screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
  }

  async function addFavorite(
    user: ReturnType<typeof userEvent.setup>,
    name: string
  ) {
    await user.click(
      await screen.findByRole("button", { name: `Favorite ${name}` })
    );
  }

  async function openFavorites(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("link", { name: /^Favorites/ }));
    await screen.findAllByRole("heading", { level: 2 });
  }

  it("lists a new favorite at the end, even when it comes first in the gallery", async () => {
    stubFetchWithArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");

    await addFavorite(user, "Wheat Field with Cypresses");
    await addFavorite(user, "The Harvesters");
    await openFavorites(user);

    expect(favoriteNames()).toEqual([
      "Wheat Field with Cypresses",
      "The Harvesters",
    ]);
  });

  it("moves a piece to the end when it is removed and added again", async () => {
    stubFetchWithArtPieces();
    const user = userEvent.setup();
    renderApp("/art-pieces");

    await addFavorite(user, "Wheat Field with Cypresses");
    await addFavorite(user, "The Harvesters");
    await addFavorite(user, "Wheat Field with Cypresses");
    await addFavorite(user, "Wheat Field with Cypresses");
    await openFavorites(user);

    expect(favoriteNames()).toEqual([
      "The Harvesters",
      "Wheat Field with Cypresses",
    ]);
  });

  it("keeps the order after a reload", async () => {
    stubFetchWithArtPieces();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { slug: "wheat-field-with-cypresses", isFavorite: true, comments: [] },
        { slug: "the-harvesters", isFavorite: true, comments: [] },
      ])
    );

    renderApp("/favorites");

    await screen.findAllByRole("heading", { level: 2 });
    expect(favoriteNames()).toEqual([
      "Wheat Field with Cypresses",
      "The Harvesters",
    ]);
  });
});

describe("App: empty favorites", () => {
  it("leads from the empty favorites page to the gallery", async () => {
    stubFetchWithArtPieces();
    const user = userEvent.setup();
    renderApp("/favorites");

    await user.click(
      await screen.findByRole("link", { name: "Browse the gallery" })
    );

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText("No favorites yet")).not.toBeInTheDocument();
  });
});
