import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FavoriteButton from "./FavoriteButton";

describe("FavoriteButton", () => {
  it("is named after the art piece", () => {
    render(
      <FavoriteButton
        artPieceName="The Harvesters"
        isFavorite={false}
        onToggle={() => {}}
      />
    );

    expect(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    ).toBeInTheDocument();
  });

  it("is not pressed when the art piece is not a favorite", () => {
    render(
      <FavoriteButton
        artPieceName="The Harvesters"
        isFavorite={false}
        onToggle={() => {}}
      />
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("is pressed when the art piece is a favorite", () => {
    render(
      <FavoriteButton
        artPieceName="The Harvesters"
        isFavorite={true}
        onToggle={() => {}}
      />
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onToggle when it is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <FavoriteButton
        artPieceName="The Harvesters"
        isFavorite={false}
        onToggle={onToggle}
      />
    );

    await user.click(screen.getByRole("button"));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
