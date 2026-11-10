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
      screen.getByRole("textbox", { name: "Edit your comment" })
    ).toHaveValue("What a view!");
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
    const field = screen.getByRole("textbox", { name: "Edit your comment" });

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
      screen.getByRole("textbox", { name: "Edit your comment" }),
      "!{Enter}"
    );

    expect(onSave).toHaveBeenCalledWith("What a view!!");
  });

  it("trims the text before passing it on", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderForm(onSave);
    const field = screen.getByRole("textbox", { name: "Edit your comment" });

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
      screen.getByRole("textbox", { name: "Edit your comment" })
    );
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSave).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    expect(
      screen.getByRole("textbox", { name: "Edit your comment" })
    ).toBeInTheDocument();
  });

  it("does not save a text that only contains spaces", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderForm(onSave);
    const field = screen.getByRole("textbox", { name: "Edit your comment" });

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
      screen.getByRole("textbox", { name: "Edit your comment" }),
      " changed"
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });
});
