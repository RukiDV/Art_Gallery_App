import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

const artPiece: ArtPiece = {
  slug: "the-harvesters",
  artist: "Pieter Bruegel the Elder",
  name: "The Harvesters",
  imageSource: "https://example.com/the-harvesters.jpg",
  year: "1565",
  genre: "Renaissance",
  colors: ["#37412E", "#8D7332"],
};

function renderPreview() {
  render(
    <MemoryRouter>
      <ArtPiecePreview
        artPiece={artPiece}
        isFavorite={false}
        onToggleFavorite={() => {}}
      />
    </MemoryRouter>
  );
}

describe("ArtPiecePreview", () => {
  it("shows the image of the art piece", () => {
    renderPreview();

    const image = screen.getByRole("img", { name: "The Harvesters" });
    expect(image).toHaveAttribute("src", artPiece.imageSource);
  });

  it("shows the title", () => {
    renderPreview();

    expect(screen.getByText("The Harvesters")).toBeInTheDocument();
  });

  it("shows the name of the artist", () => {
    renderPreview();

    expect(screen.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
  });

  it("keeps the favorite button outside of the details link", () => {
    renderPreview();

    expect(screen.getByRole("link")).not.toContainElement(
      screen.getByRole("button", { name: "Favorite The Harvesters" })
    );
  });

  it("links to the details page of the art piece", () => {
    renderPreview();

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/art-pieces/the-harvesters"
    );
    expect(screen.getByRole("link")).toHaveTextContent("The Harvesters");
    expect(screen.getByRole("link")).toContainElement(
      screen.getByRole("img", { name: "The Harvesters" })
    );
  });
});

describe("ArtPiecePreview: back of the card", () => {
  function back() {
    return document.querySelector(".card-back");
  }

  it("shows the year, the genre and a hint to open the details", () => {
    renderPreview();

    expect(back()).toHaveTextContent("1565");
    expect(back()).toHaveTextContent("Renaissance");
    expect(back()).toHaveTextContent("View details");
  });

  it("shows one dot per color of the art piece", () => {
    renderPreview();

    const dots = Array.from(
      document.querySelectorAll<HTMLElement>(".card-back .card-swatch")
    ).map((dot) => dot.style.backgroundColor);

    expect(dots).toEqual(["rgb(55, 65, 46)", "rgb(141, 115, 50)"]);
  });

  it("is hidden from screen readers and stays inside the details link", () => {
    renderPreview();

    expect(back()).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("link")).toContainElement(back() as HTMLElement);
    expect(screen.getByRole("link")).not.toHaveAccessibleName(/View details/);
  });

  it("does not repeat the title or the artist", () => {
    renderPreview();

    expect(back()).not.toHaveTextContent("The Harvesters");
    expect(back()).not.toHaveTextContent("Pieter Bruegel the Elder");
  });

  it("has a decorative arrow chip for touch screens", () => {
    renderPreview();

    expect(document.querySelector(".card-chip")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });
});

describe("ArtPiecePreview: shape of the picture", () => {
  function figure() {
    return screen.getByRole("figure");
  }

  function loadImage(naturalWidth: number, naturalHeight: number) {
    const image = screen.getByRole("img", { name: "The Harvesters" });
    Object.defineProperty(image, "naturalWidth", { value: naturalWidth });
    Object.defineProperty(image, "naturalHeight", { value: naturalHeight });
    fireEvent.load(image);
  }

  it("has no picture shape until the picture is loaded", () => {
    renderPreview();

    expect(figure().style.getPropertyValue("--ratio")).toBe("");
  });

  it("takes the width-to-height ratio of the loaded picture", () => {
    renderPreview();

    loadImage(1600, 800);

    expect(figure().style.getPropertyValue("--ratio")).toBe("2");
  });

  it("rounds the ratio", () => {
    renderPreview();

    loadImage(1000, 3000);

    expect(figure().style.getPropertyValue("--ratio")).toBe("0.333");
  });

  it("ignores a picture without a size", () => {
    renderPreview();

    loadImage(0, 0);

    expect(figure().style.getPropertyValue("--ratio")).toBe("");
  });
});
