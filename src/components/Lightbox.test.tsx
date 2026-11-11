import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Lightbox from "./Lightbox";

function renderLightbox(onClose: () => void = () => {}) {
  return render(
    <Lightbox
      imageSource="https://example.com/the-harvesters.jpg"
      name="The Harvesters"
      artist="Pieter Bruegel the Elder"
      glow="#37412E"
      onClose={onClose}
    />
  );
}

afterEach(() => {
  document.body.style.overflow = "";
});

describe("Lightbox", () => {
  it("is a modal dialog named after the painting", () => {
    renderLightbox();

    const dialog = screen.getByRole("dialog", { name: "The Harvesters" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("shows the large picture with its title and artist", () => {
    renderLightbox();
    const dialog = within(screen.getByRole("dialog"));

    expect(dialog.getByRole("img", { name: "The Harvesters" })).toHaveAttribute(
      "src",
      "https://example.com/the-harvesters.jpg"
    );
    expect(dialog.getByText("The Harvesters")).toBeInTheDocument();
    expect(dialog.getByText("Pieter Bruegel the Elder")).toBeInTheDocument();
  });

  it("takes the glow color from its prop", () => {
    renderLightbox();

    expect(
      screen.getByRole("dialog").style.getPropertyValue("--art-glow")
    ).toBe("#37412E");
  });

  it("hides the blurred backdrop and the close icon from screen readers", () => {
    renderLightbox();
    const dialog = screen.getByRole("dialog");

    expect(dialog.querySelector(".lightbox-backdrop")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    expect(
      screen.getByRole("button", { name: "Close" }).querySelector("svg")
    ).toHaveAttribute("aria-hidden", "true");
  });
});

describe("Lightbox: closing", () => {
  it("closes with the Close button, once", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderLightbox(onClose);

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes with Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderLightbox(onClose);

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not react to Escape any more after it is removed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { unmount } = renderLightbox(onClose);

    unmount();
    await user.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes with a click on the backdrop", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderLightbox(onClose);

    await user.click(
      screen.getByRole("dialog").querySelector(".lightbox-backdrop") as Element
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close with a click on the picture or on the caption", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderLightbox(onClose);
    const dialog = within(screen.getByRole("dialog"));

    await user.click(dialog.getByRole("img", { name: "The Harvesters" }));
    await user.click(dialog.getByText("Pieter Bruegel the Elder"));

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("Lightbox: focus", () => {
  it("moves the focus to the Close button when it opens", () => {
    renderLightbox();

    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("keeps the focus on the Close button with Tab and Shift+Tab", async () => {
    const user = userEvent.setup();
    renderLightbox();
    const close = screen.getByRole("button", { name: "Close" });

    await user.tab();
    expect(close).toHaveFocus();

    await user.tab({ shift: true });
    expect(close).toHaveFocus();
  });

  it("gives the focus back to the element that had it before", () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();

    const { unmount } = renderLightbox();
    expect(opener).not.toHaveFocus();

    unmount();
    expect(opener).toHaveFocus();

    opener.remove();
  });
});

describe("Lightbox: page scroll", () => {
  it("locks the scrolling of the page while it is open and restores it afterwards", () => {
    document.body.style.overflow = "auto";

    const { unmount } = renderLightbox();
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });
});
