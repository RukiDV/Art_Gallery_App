import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockRandomFraction } from "../mockRandom";
import type { ArtPiece } from "../types";
import SpotlightPage from "./SpotlightPage";

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

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function spotlight(
  isFavorite: (slug: string) => boolean = () => false,
  onToggleFavorite: (slug: string) => void = () => {},
  pieces: ArtPiece[] = artPieces
) {
  return (
    <SpotlightPage
      artPieces={pieces}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
    />
  );
}

describe("SpotlightPage", () => {
  it("shows the image of the selected art piece", () => {
    mockRandomFraction(0.99);

    render(spotlight());

    const image = screen.getByRole("img", {
      name: "Wheat Field with Cypresses",
    });
    expect(image).toHaveAttribute("src", artPieces[1].imageSource);
  });

  it("shows the artist of the selected art piece and no other", () => {
    mockRandomFraction(0.99);

    render(spotlight());

    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
    expect(
      screen.queryByText("Pieter Bruegel the Elder")
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("keeps the same art piece when it re-renders", () => {
    const setRandomFraction = mockRandomFraction(0);
    const { rerender } = render(spotlight());

    setRandomFraction(0.99);
    rerender(spotlight());

    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
    expect(screen.queryByText("Vincent van Gogh")).not.toBeInTheDocument();
  });

  it("shows a favorite button for the selected art piece", () => {
    mockRandomFraction(0.99);

    render(spotlight((slug) => slug === "wheat-field-with-cypresses"));

    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("button", { name: /^Favorite / })).toHaveLength(
      1
    );
  });

  it("reports the slug of the selected art piece when the button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleFavorite = vi.fn();
    mockRandomFraction(0.99);
    render(spotlight(() => false, onToggleFavorite));

    await user.click(screen.getByRole("button", { name: /^Favorite / }));

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleFavorite).toHaveBeenCalledWith("wheat-field-with-cypresses");
  });
});

describe("SpotlightPage: Show another", () => {
  it("has a button named Show another when there are several pieces", () => {
    render(spotlight());

    expect(
      screen.getByRole("button", { name: "Show another" })
    ).toBeInTheDocument();
  });

  it("shows another piece with its image, artist and favorite button after a click", async () => {
    const user = userEvent.setup();
    mockRandomFraction(0);
    render(spotlight());
    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show another" }));

    expect(
      screen.getByRole("img", { name: "Wheat Field with Cypresses" })
    ).toHaveAttribute("src", artPieces[1].imageSource);
    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
    expect(
      screen.queryByText("Pieter Bruegel the Elder")
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("shows the favorite status of the new piece", async () => {
    const user = userEvent.setup();
    mockRandomFraction(0);
    render(spotlight((slug) => slug === "wheat-field-with-cypresses"));
    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: "Show another" }));

    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("never shows the same piece twice in a row", async () => {
    const user = userEvent.setup();
    const setRandomFraction = mockRandomFraction(0);
    render(spotlight(undefined, undefined, threePieces));

    for (const fraction of [0, 0.3, 0.5, 0.7, 0.999, 0, 0.5]) {
      const shown = screen.getByRole("img").getAttribute("alt");
      setRandomFraction(fraction);

      await user.click(screen.getByRole("button", { name: "Show another" }));

      expect(screen.getByRole("img").getAttribute("alt")).not.toBe(shown);
    }
  });

  it("always shows the other piece when there are exactly two", async () => {
    const user = userEvent.setup();
    const setRandomFraction = mockRandomFraction(0);
    render(spotlight());
    let expected = "Wheat Field with Cypresses";

    for (const fraction of [0, 0.999, 0.5, 0]) {
      setRandomFraction(fraction);

      await user.click(screen.getByRole("button", { name: "Show another" }));

      expect(screen.getByRole("img")).toHaveAttribute("alt", expected);
      expected =
        expected === "Wheat Field with Cypresses"
          ? "The Harvesters"
          : "Wheat Field with Cypresses";
    }
  });

  it("has no Show another button with only one piece", () => {
    render(spotlight(undefined, undefined, [artPieces[0]]));

    expect(
      screen.queryByRole("button", { name: "Show another" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toBeInTheDocument();
  });

  it("keeps the shown piece when it re-renders after Show another", async () => {
    const user = userEvent.setup();
    const setRandomFraction = mockRandomFraction(0);
    const { rerender } = render(spotlight());
    await user.click(screen.getByRole("button", { name: "Show another" }));

    setRandomFraction(0);
    rerender(spotlight((slug) => slug === "wheat-field-with-cypresses"));

    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Favorite Wheat Field with Cypresses",
      })
    ).toHaveAttribute("aria-pressed", "true");
  });
});

describe("SpotlightPage: slideshow button", () => {
  it("has a button named Start slideshow when there are several pieces", () => {
    render(spotlight());

    expect(
      screen.getByRole("button", { name: "Start slideshow" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Stop slideshow" })
    ).not.toBeInTheDocument();
  });

  it("is labeled Stop slideshow after Start slideshow is clicked, and back after Stop", async () => {
    const user = userEvent.setup();
    render(spotlight());

    await user.click(screen.getByRole("button", { name: "Start slideshow" }));

    expect(
      screen.getByRole("button", { name: "Stop slideshow" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Start slideshow" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Stop slideshow" }));

    expect(
      screen.getByRole("button", { name: "Start slideshow" })
    ).toBeInTheDocument();
  });

  it("has no slideshow button with only one piece", () => {
    render(spotlight(undefined, undefined, [artPieces[0]]));

    expect(
      screen.queryByRole("button", { name: /slideshow/ })
    ).not.toBeInTheDocument();
  });

  it("announces the shown piece politely to screen readers", () => {
    render(spotlight());

    expect(screen.getByRole("figure")).toHaveAttribute("aria-live", "polite");
  });
});

describe("SpotlightPage: slideshow timer", () => {
  const SLIDE_MS = 5000;

  function setUp() {
    // Only the interval is faked: Testing Library waits on a real setTimeout.
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    return userEvent.setup();
  }

  function advance(ms: number) {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  }

  function shownName() {
    return screen.getByRole("img").getAttribute("alt");
  }

  async function startSlideshow(user: ReturnType<typeof setUp>) {
    await user.click(screen.getByRole("button", { name: "Start slideshow" }));
  }

  it("does not change the piece or start a timer by itself", () => {
    setUp();
    mockRandomFraction(0);
    render(spotlight());

    advance(4 * SLIDE_MS);

    expect(shownName()).toBe("The Harvesters");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("shows another piece after 5 seconds, not before", async () => {
    const user = setUp();
    mockRandomFraction(0);
    render(spotlight());
    await startSlideshow(user);

    advance(SLIDE_MS - 1);
    expect(shownName()).toBe("The Harvesters");

    advance(1);
    expect(shownName()).toBe("Wheat Field with Cypresses");
    expect(screen.getByText("Vincent van Gogh")).toBeInTheDocument();
  });

  it("never shows the same piece twice in a row while it runs", async () => {
    const user = setUp();
    const setRandomFraction = mockRandomFraction(0);
    render(spotlight(undefined, undefined, threePieces));
    await startSlideshow(user);

    for (const fraction of [0, 0.3, 0.5, 0.7, 0.999, 0, 0.5]) {
      const shown = shownName();
      setRandomFraction(fraction);

      advance(SLIDE_MS);

      expect(shownName()).not.toBe(shown);
    }
  });

  it("keeps showing a new piece every 5 seconds", async () => {
    const user = setUp();
    mockRandomFraction(0);
    render(spotlight());
    await startSlideshow(user);

    advance(SLIDE_MS);
    expect(shownName()).toBe("Wheat Field with Cypresses");
    advance(SLIDE_MS);
    expect(shownName()).toBe("The Harvesters");
    advance(SLIDE_MS);
    expect(shownName()).toBe("Wheat Field with Cypresses");
  });

  it("stops on Stop slideshow, keeps the shown piece and leaves no timer", async () => {
    const user = setUp();
    mockRandomFraction(0);
    render(spotlight());
    await startSlideshow(user);
    advance(SLIDE_MS);
    const shown = shownName();

    await user.click(screen.getByRole("button", { name: "Stop slideshow" }));
    advance(4 * SLIDE_MS);

    expect(shownName()).toBe(shown);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("restarts the 5 seconds when Show another is clicked during the slideshow", async () => {
    const user = setUp();
    mockRandomFraction(0);
    render(spotlight());
    await startSlideshow(user);

    advance(3000);
    await user.click(screen.getByRole("button", { name: "Show another" }));
    expect(shownName()).toBe("Wheat Field with Cypresses");

    advance(3000);
    expect(shownName()).toBe("Wheat Field with Cypresses");

    advance(2000);
    expect(shownName()).toBe("The Harvesters");
    expect(
      screen.getByRole("button", { name: "Stop slideshow" })
    ).toBeInTheDocument();
  });

  it("neither changes the piece nor restarts the 5 seconds when a favorite changes", async () => {
    const user = setUp();
    mockRandomFraction(0);
    const { rerender } = render(spotlight());
    await startSlideshow(user);

    advance(3000);
    rerender(spotlight((slug) => slug === "the-harvesters"));
    expect(shownName()).toBe("The Harvesters");

    advance(2000);
    expect(shownName()).toBe("Wheat Field with Cypresses");
  });

  it("leaves no timer when the page is left during the slideshow", async () => {
    const user = setUp();
    mockRandomFraction(0);
    const { unmount } = render(spotlight());
    await startSlideshow(user);
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("SpotlightPage: icon buttons", () => {
  it("shows only an icon in the Show another button, hidden from screen readers", () => {
    render(spotlight());

    const button = screen.getByRole("button", { name: "Show another" });

    expect(button.textContent).toBe("");
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("shows only an icon in the slideshow button, before and after it is clicked", async () => {
    const user = userEvent.setup();
    render(spotlight());

    const start = screen.getByRole("button", { name: "Start slideshow" });
    expect(start.textContent).toBe("");
    expect(start.querySelector("svg")).toHaveAttribute("aria-hidden", "true");

    await user.click(start);

    const stop = screen.getByRole("button", { name: "Stop slideshow" });
    expect(stop.textContent).toBe("");
    expect(stop.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("shows a different icon for Start and Stop", async () => {
    const user = userEvent.setup();
    render(spotlight());

    const startIcon = screen
      .getByRole("button", { name: "Start slideshow" })
      .querySelector("svg")?.innerHTML;
    await user.click(screen.getByRole("button", { name: "Start slideshow" }));
    const stopIcon = screen
      .getByRole("button", { name: "Stop slideshow" })
      .querySelector("svg")?.innerHTML;

    expect(startIcon).toBeTruthy();
    expect(stopIcon).toBeTruthy();
    expect(stopIcon).not.toBe(startIcon);
  });
});

describe("SpotlightPage: palette dots", () => {
  function swatchColors(container: HTMLElement) {
    return Array.from(
      container.querySelectorAll<HTMLElement>(".spotlight-swatch")
    ).map((swatch) => swatch.style.backgroundColor);
  }

  it("shows one dot per color of the shown piece, and no extra text", () => {
    mockRandomFraction(0);
    const { container } = render(spotlight());

    expect(swatchColors(container)).toEqual([
      "rgb(55, 65, 46)",
      "rgb(141, 115, 50)",
    ]);
    expect(screen.getByRole("figure")).toHaveTextContent(
      "Pieter Bruegel the Elder"
    );
    expect(screen.getByRole("figure").textContent).toBe(
      "Pieter Bruegel the Elder"
    );
  });

  it("changes the dots when another piece is shown", async () => {
    mockRandomFraction(0);
    const user = userEvent.setup();
    const { container } = render(spotlight());

    await user.click(screen.getByRole("button", { name: "Show another" }));

    expect(swatchColors(container)).toEqual([
      "rgb(113, 143, 152)",
      "rgb(157, 165, 158)",
    ]);
  });
});
