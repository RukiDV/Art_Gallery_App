import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SortSelect from "./SortSelect";

describe("SortSelect", () => {
  it("is a dropdown labelled Sort by", () => {
    render(<SortSelect value="default" onChange={() => {}} />);

    expect(
      screen.getByRole("combobox", { name: "Sort by" })
    ).toBeInTheDocument();
  });

  it("offers the five ways to sort", () => {
    render(<SortSelect value="default" onChange={() => {}} />);

    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual([
      "Default order",
      "Name (A–Z)",
      "Artist (A–Z)",
      "Year (oldest first)",
      "Year (newest first)",
    ]);
  });

  it("shows the chosen way to sort", () => {
    render(<SortSelect value="year-desc" onChange={() => {}} />);

    expect(
      screen.getByRole("option", {
        name: "Year (newest first)",
        selected: true,
      })
    ).toBeInTheDocument();
  });

  it("reports the value of the option that is chosen", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortSelect value="default" onChange={onChange} />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sort by" }),
      "Artist (A–Z)"
    );

    expect(onChange).toHaveBeenCalledWith("artist");
  });
});
