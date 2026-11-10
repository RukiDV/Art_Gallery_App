import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CommentEditForm from "./CommentEditForm";

function renderForm(
  onSave: (text: string) => void = () => {},
  onCancel: () => void = () => {}
) {
  render(
    <CommentEditForm
      initialText="What a view!"
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}

describe("CommentEditForm", () => {
  it("shows a text field with the current text", () => {
    renderForm();

    expect(
      screen.getByRole("textbox", { name: /^Edit your comment/ })
    ).toHaveValue("What a view!");
  });

  it("names the text field after the comment that is edited", () => {
    renderForm();

    expect(
      screen.getByRole("textbox", {
        name: "Edit your comment: What a view!",
      })
    ).toBeInTheDocument();
  });

  it("has a Save and a Cancel button", () => {
    renderForm();

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("passes the changed text to onSave when Save is clicked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderForm(onSave);
    const field = screen.getByRole("textbox", { name: /^Edit your comment/ });

    await user.clear(field);
    await user.type(field, "What a beautiful view!");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith("What a beautiful view!");
  });

  it("saves with the Enter key", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderForm(onSave);

    await user.type(
      screen.getByRole("textbox", { name: /^Edit your comment/ }),
      "!{Enter}"
    );

    expect(onSave).toHaveBeenCalledWith("What a view!!");
  });

  it("trims the text before passing it on", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderForm(onSave);
    const field = screen.getByRole("textbox", { name: /^Edit your comment/ });

    await user.clear(field);
    await user.type(field, "   Padded text   ");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).toHaveBeenCalledWith("Padded text");
  });

  it("does not save an empty text and stays open", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();
    renderForm(onSave, onCancel);

    await user.clear(
      screen.getByRole("textbox", { name: /^Edit your comment/ })
    );
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    expect(
      screen.getByRole("textbox", { name: /^Edit your comment/ })
    ).toBeInTheDocument();
  });

  it("tells the user that an empty text cannot be saved and marks the field as invalid", async () => {
    const user = userEvent.setup();
    renderForm();
    const field = screen.getByRole("textbox", { name: /^Edit your comment/ });

    await user.clear(field);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "A comment cannot be empty."
    );
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("A comment cannot be empty.");
  });

  it("gives the same feedback for a text that only contains spaces", async () => {
    const user = userEvent.setup();
    renderForm();
    const field = screen.getByRole("textbox", { name: /^Edit your comment/ });

    await user.clear(field);
    await user.type(field, "   ");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("removes the feedback as soon as the user types again", async () => {
    const user = userEvent.setup();
    renderForm();
    const field = screen.getByRole("textbox", { name: /^Edit your comment/ });

    await user.clear(field);
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.type(field, "Something");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(field).not.toHaveAttribute("aria-invalid", "true");
  });

  it("shows no feedback before anything was saved", () => {
    renderForm();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /^Edit your comment/ })
    ).not.toHaveAttribute("aria-invalid", "true");
  });

  it("does not save a text that only contains spaces", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderForm(onSave);
    const field = screen.getByRole("textbox", { name: /^Edit your comment/ });

    await user.clear(field);
    await user.type(field, "     ");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).not.toHaveBeenCalled();
  });

  it("calls onCancel and not onSave when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();
    renderForm(onSave, onCancel);

    await user.type(
      screen.getByRole("textbox", { name: /^Edit your comment/ }),
      " changed"
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });
});
