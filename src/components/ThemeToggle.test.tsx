import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockColorScheme } from "../mockColorScheme";
import { THEME_STORAGE_KEY } from "../theme";
import ThemeToggle from "./ThemeToggle";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ThemeToggle", () => {
  it("offers the dark mode in the light mode", () => {
    mockColorScheme("light");

    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: "Switch to dark mode" })
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
  });

  it("offers the light mode when the system setting is dark", () => {
    mockColorScheme("dark");

    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: "Switch to light mode" })
    ).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("switches to dark and back to light with each click", async () => {
    const user = userEvent.setup();
    mockColorScheme("light");
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" })
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(
      screen.queryByRole("button", { name: "Switch to dark mode" })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Switch to light mode" })
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(
      screen.getByRole("button", { name: "Switch to dark mode" })
    ).toBeInTheDocument();
  });

  it("saves the choice under its own key on click", async () => {
    const user = userEvent.setup();
    mockColorScheme("light");
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" })
    );
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    await user.click(
      screen.getByRole("button", { name: "Switch to light mode" })
    );
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("saves nothing as long as the user does not click", () => {
    mockColorScheme("dark");

    render(<ThemeToggle />);

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it.each([
    ["dark", "light", "Switch to light mode"],
    ["light", "dark", "Switch to dark mode"],
  ] as const)(
    "starts in the saved %s mode after a reload although the system says %s",
    (saved, scheme, label) => {
      mockColorScheme(scheme);
      localStorage.setItem(THEME_STORAGE_KEY, saved);

      render(<ThemeToggle />);

      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
      expect(document.documentElement).toHaveAttribute("data-theme", saved);
    }
  );

  it("ignores a broken saved value and uses the system setting", () => {
    mockColorScheme("dark");
    localStorage.setItem(THEME_STORAGE_KEY, "blue");

    render(<ThemeToggle />);

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("still switches when the choice cannot be saved", async () => {
    const user = userEvent.setup();
    mockColorScheme("light");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" })
    );

    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
  });

  it("works without matchMedia and without a saved choice", () => {
    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: "Switch to dark mode" })
    ).toBeInTheDocument();
  });

  it("shows an icon instead of text, and a different icon in each mode", async () => {
    const user = userEvent.setup();
    mockColorScheme("light");
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Switch to dark mode" });
    const lightModeIcon = button.querySelector("svg")?.innerHTML;

    expect(button).toHaveTextContent("");
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");

    await user.click(button);

    const darkModeButton = screen.getByRole("button", {
      name: "Switch to light mode",
    });
    expect(darkModeButton).toHaveTextContent("");
    expect(darkModeButton.querySelector("svg")).not.toBeNull();
    expect(darkModeButton.querySelector("svg")?.innerHTML).not.toBe(
      lightModeIcon
    );
  });
});

describe("ThemeToggle: circular reveal", () => {
  type FakeTransition = { finished: Promise<void>; ready: Promise<void> };
  const root = document.documentElement;

  function stubViewTransition(finished: Promise<void> = Promise.resolve()) {
    const startViewTransition = vi.fn((update: () => void): FakeTransition => {
      update();
      return { finished, ready: Promise.resolve() };
    });
    Object.assign(document, { startViewTransition });
    return startViewTransition;
  }

  function stubAnimate() {
    const animate = vi.fn();
    Object.assign(root, { animate });
    return animate;
  }

  function stubReducedMotion() {
    vi.stubGlobal(
      "matchMedia",
      (query: string) =>
        ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList
    );
  }

  function expectedRadius(x: number, y: number) {
    return Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
  }

  afterEach(() => {
    Reflect.deleteProperty(document, "startViewTransition");
    Reflect.deleteProperty(root, "animate");
    root.classList.remove("theme-reveal");
  });

  it("switches the mode inside a view transition when the browser has them", async () => {
    const user = userEvent.setup();
    mockColorScheme("light");
    const startViewTransition = stubViewTransition();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" })
    );

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(root).toHaveAttribute("data-theme", "dark");
    expect(
      screen.getByRole("button", { name: "Switch to light mode" })
    ).toBeInTheDocument();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("grows the new mode as a circle that starts where the mouse clicked", async () => {
    mockColorScheme("light");
    stubViewTransition();
    const animate = stubAnimate();
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button"), { clientX: 120, clientY: 40 });

    await waitFor(() => expect(animate).toHaveBeenCalledTimes(1));
    const [keyframes, options] = animate.mock.calls[0];
    expect(keyframes.clipPath).toEqual([
      "circle(0px at 120px 40px)",
      `circle(${expectedRadius(120, 40)}px at 120px 40px)`,
    ]);
    expect(options).toMatchObject({
      duration: 700,
      pseudoElement: "::view-transition-new(root)",
    });
  });

  it("starts the circle at the middle of the button when there is no mouse position", async () => {
    mockColorScheme("light");
    stubViewTransition();
    const animate = stubAnimate();
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 20,
      width: 40,
      height: 40,
    } as DOMRect);

    fireEvent.click(button, { clientX: 0, clientY: 0 });

    await waitFor(() => expect(animate).toHaveBeenCalledTimes(1));
    expect(animate.mock.calls[0][0].clipPath[0]).toBe(
      "circle(0px at 120px 40px)"
    );
  });

  it("marks the page as revealing only while the transition runs", async () => {
    mockColorScheme("light");
    let finish: () => void = () => {};
    stubViewTransition(new Promise<void>((resolve) => (finish = resolve)));
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button"));
    expect(root).toHaveClass("theme-reveal");

    finish();
    await waitFor(() => expect(root).not.toHaveClass("theme-reveal"));
  });

  it("skips the transition for people who prefer less motion, and still switches", async () => {
    const user = userEvent.setup();
    stubReducedMotion();
    const startViewTransition = stubViewTransition();
    render(<ThemeToggle />);

    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" })
    );

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(root).toHaveAttribute("data-theme", "dark");
  });
});
