import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import SearchField from "./SearchField";

function StatefulSearchField({
  onChange,
}: {
  onChange: (value: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <SearchField
      value={value}
      onChange={(newValue) => {
        setValue(newValue);
        onChange(newValue);
      }}
    />
  );
}

describe("SearchField", () => {
  it("is a search field labeled Search", () => {
    render(<SearchField value="" onChange={() => {}} />);

    expect(
      screen.getByRole("searchbox", { name: "Search" })
    ).toBeInTheDocument();
  });

  it("shows the value it gets", () => {
    render(<SearchField value="gogh" onChange={() => {}} />);

    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue(
      "gogh"
    );
  });

  it("reports the whole text after every typed character", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StatefulSearchField onChange={onChange} />);

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "van");

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(1, "v");
    expect(onChange).toHaveBeenNthCalledWith(2, "va");
    expect(onChange).toHaveBeenNthCalledWith(3, "van");
  });

  it("reports an empty text when the field is cleared", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchField value="gogh" onChange={onChange} />);

    await user.clear(screen.getByRole("searchbox", { name: "Search" }));

    expect(onChange).toHaveBeenCalledWith("");
  });
});
