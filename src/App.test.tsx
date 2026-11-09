import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { SWRConfig } from "swr";

import App from "./App";
import { mockRandomFraction } from "./mockRandom";
import type { ArtPiece } from "./types";

const artPieces: ArtPiece[] = [
  {
    slug: "the-harvesters",
    artist: "Pieter Bruegel the Elder",
    name: "The Harvesters",
    imageSource: "https://example.com/the-harvesters.jpg",
    year: "1565",
    genre: "Renaissance",
  },
  {
    slug: "wheat-field-with-cypresses",
    artist: "Vincent van Gogh",
    name: "Wheat Field with Cypresses",
    imageSource: "https://example.com/wheat-field.jpg",
    year: "1889",
    genre: "Landscape Painting",
  },
];

function renderApp(route: string) {
  render(
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
});

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
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
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
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
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
});
