import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import GenreFilter from "./GenreFilter";

const genres = ["Landscape Painting", "Renaissance"];

describe("GenreFilter", () => {
  it("is a control labeled Genre", () => {
    render(<GenreFilter genres={genres} value="" onChange={() => {}} />);

    expect(screen.getByRole("combobox", { name: "Genre" })).toBeInTheDocument();
  });

  it('starts with the option "All genres" followed by every genre', () => {
    render(<GenreFilter genres={genres} value="" onChange={() => {}} />);

    const options = within(
      screen.getByRole("combobox", { name: "Genre" })
    ).getAllByRole("option");

    expect(options.map((option) => option.textContent)).toEqual([
      "All genres",
      "Landscape Painting",
      "Renaissance",
    ]);
  });

  it('only has "All genres" when there are no genres', () => {
    render(<GenreFilter genres={[]} value="" onChange={() => {}} />);

    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(
      screen.getByRole("option", { name: "All genres" })
    ).toBeInTheDocument();
  });

  it('selects "All genres" when the value is empty', () => {
    render(<GenreFilter genres={genres} value="" onChange={() => {}} />);

    expect(
      screen.getByRole("option", { name: "All genres", selected: true })
    ).toBeInTheDocument();
  });

  it("selects the genre of the value", () => {
    render(
      <GenreFilter genres={genres} value="Renaissance" onChange={() => {}} />
    );

    expect(
      screen.getByRole("option", { name: "Renaissance", selected: true })
    ).toBeInTheDocument();
  });

  it("reports the chosen genre", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<GenreFilter genres={genres} value="" onChange={onChange} />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "Renaissance"
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("Renaissance");
  });

  it('reports an empty value when "All genres" is chosen', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <GenreFilter genres={genres} value="Renaissance" onChange={onChange} />
    );

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Genre" }),
      "All genres"
    );

    expect(onChange).toHaveBeenCalledWith("");
  });
});
