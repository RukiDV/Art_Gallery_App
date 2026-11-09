import { render, screen, within } from "@testing-library/react";

import ColorPalette from "./ColorPalette";

const colors = ["#37412E", "#8D7332", "#838665"];

describe("ColorPalette", () => {
  it("shows a list named Color palette with one item per color", () => {
    render(<ColorPalette colors={colors} />);

    const list = screen.getByRole("list", { name: "Color palette" });

    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });

  it("shows every color as a swatch with its own background color, in order", () => {
    render(<ColorPalette colors={colors} />);

    const items = screen.getAllByRole("listitem");

    colors.forEach((color, index) => {
      expect(items[index]).toHaveStyle({ backgroundColor: color });
    });
  });

  it("makes the hex value of each color available as a title", () => {
    render(<ColorPalette colors={colors} />);

    colors.forEach((color) => {
      expect(screen.getByTitle(color)).toBeInTheDocument();
    });
  });

  it("shows a swatch for each entry when a color appears more than once", () => {
    render(<ColorPalette colors={["#37412E", "#37412E"]} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows no swatches when there are no colors", () => {
    render(<ColorPalette colors={[]} />);

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
