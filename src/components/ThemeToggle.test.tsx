import { render, screen } from "@testing-library/react";
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
