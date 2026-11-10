import { fireEvent, render, screen } from "@testing-library/react";
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

describe("FavoriteButton: pop animation", () => {
  function renderButton(isFavorite: boolean) {
    render(
      <FavoriteButton
        artPieceName="The Harvesters"
        isFavorite={isFavorite}
        onToggle={() => {}}
      />
    );
    return screen.getByRole("button");
  }

  it("does not pop by itself, not even for a favorite", () => {
    expect(renderButton(true)).not.toHaveClass("favorite-pop");
  });

  it("pops when a piece is marked as favorite, and stops when the animation ends", async () => {
    const user = userEvent.setup();
    const button = renderButton(false);

    await user.click(button);
    expect(button).toHaveClass("favorite-pop");

    fireEvent.animationEnd(button);
    expect(button).not.toHaveClass("favorite-pop");
  });

  it("does not pop when the favorite is removed", async () => {
    const user = userEvent.setup();
    const button = renderButton(true);

    await user.click(button);

    expect(button).not.toHaveClass("favorite-pop");
  });
});
