import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ColorFamily } from "../colorFamilies";
import ColorFilter from "./ColorFilter";

function renderFilter(
  families: ColorFamily[] = ["Red", "Blue", "Neutral"],
  selected: ColorFamily[] = [],
  onChange: (family: ColorFamily) => void = () => {}
) {
  render(
    <ColorFilter families={families} selected={selected} onChange={onChange} />
  );
}

describe("ColorFilter", () => {
  it("is a group named Color", () => {
    renderFilter();

    expect(screen.getByRole("group", { name: "Color" })).toBeInTheDocument();
  });

  it("has one checkbox per available family, named after the family, in the given order", () => {
    renderFilter();

    const checkboxes = screen.getAllByRole("checkbox");

    expect(checkboxes).toHaveLength(3);
    expect(
      checkboxes.map((checkbox) => checkbox.closest("label")?.textContent)
    ).toEqual(["Red", "Blue", "Neutral"]);
    expect(screen.getByRole("checkbox", { name: "Blue" })).toBeInTheDocument();
  });

  it("shows each family as a circle in its color", () => {
    renderFilter();

    const circle = screen
      .getByRole("checkbox", { name: "Blue" })
      .closest("label")
      ?.querySelector('[aria-hidden="true"]');

    expect(circle).toHaveStyle({ backgroundColor: "#2f6fb5" });
  });

  it("checks only the selected families", () => {
    renderFilter(["Red", "Blue", "Neutral"], ["Blue", "Neutral"]);

    expect(screen.getByRole("checkbox", { name: "Red" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Blue" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Neutral" })).toBeChecked();
  });

  it("reports the family when its checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilter(["Red", "Blue", "Neutral"], [], onChange);

    await user.click(screen.getByRole("checkbox", { name: "Blue" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("Blue");
  });

  it("reports the family of a checked checkbox again when it is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilter(["Red", "Blue"], ["Red"], onChange);

    await user.click(screen.getByRole("checkbox", { name: "Red" }));

    expect(onChange).toHaveBeenCalledWith("Red");
  });

  it("can be used with the keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilter(["Red", "Blue"], [], onChange);

    await user.tab();
    expect(screen.getByRole("checkbox", { name: "Red" })).toHaveFocus();
    await user.keyboard(" ");

    expect(onChange).toHaveBeenCalledWith("Red");
  });

  it("shows nothing when there is no family to choose from", () => {
    renderFilter([], []);

    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});
