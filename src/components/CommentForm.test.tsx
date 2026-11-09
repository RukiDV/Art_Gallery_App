import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CommentForm from "./CommentForm";

describe("CommentForm", () => {
  it("has a text field and a submit button", () => {
    render(<CommentForm onAddComment={() => {}} />);

    expect(
      screen.getByRole("textbox", { name: "Your comment" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add comment" })
    ).toBeInTheDocument();
  });

  it("passes the written text to onAddComment when the form is submitted", async () => {
    const user = userEvent.setup();
    const onAddComment = vi.fn();
    render(<CommentForm onAddComment={onAddComment} />);

    await user.type(
      screen.getByRole("textbox", { name: "Your comment" }),
      "What a beautiful sky!"
    );
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(onAddComment).toHaveBeenCalledTimes(1);
    expect(onAddComment).toHaveBeenCalledWith("What a beautiful sky!");
  });

  it("submits with the Enter key", async () => {
    const user = userEvent.setup();
    const onAddComment = vi.fn();
    render(<CommentForm onAddComment={onAddComment} />);

    await user.type(
      screen.getByRole("textbox", { name: "Your comment" }),
      "Nice!{Enter}"
    );

    expect(onAddComment).toHaveBeenCalledWith("Nice!");
  });

  it("clears the text field after a comment was added", async () => {
    const user = userEvent.setup();
    render(<CommentForm onAddComment={() => {}} />);
    const field = screen.getByRole("textbox", { name: "Your comment" });

    await user.type(field, "Nice!");
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(field).toHaveValue("");
  });

  it("trims the text before passing it on", async () => {
    const user = userEvent.setup();
    const onAddComment = vi.fn();
    render(<CommentForm onAddComment={onAddComment} />);

    await user.type(
      screen.getByRole("textbox", { name: "Your comment" }),
      "   Nice!   "
    );
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(onAddComment).toHaveBeenCalledWith("Nice!");
  });

  it("does not submit an empty comment", async () => {
    const user = userEvent.setup();
    const onAddComment = vi.fn();
    render(<CommentForm onAddComment={onAddComment} />);

    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(onAddComment).not.toHaveBeenCalled();
  });

  it("does not submit a comment that only contains spaces", async () => {
    const user = userEvent.setup();
    const onAddComment = vi.fn();
    render(<CommentForm onAddComment={onAddComment} />);

    await user.type(
      screen.getByRole("textbox", { name: "Your comment" }),
      "     "
    );
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    expect(onAddComment).not.toHaveBeenCalled();
  });
});
