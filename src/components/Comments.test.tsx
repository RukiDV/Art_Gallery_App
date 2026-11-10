import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ArtPieceComment } from "../types";
import Comments from "./Comments";

const comments: ArtPieceComment[] = [
  { id: "c1", text: "What a beautiful sky!", date: "2026-11-09T10:15:00.000Z" },
  { id: "c2", text: "I love the colors.", date: "2026-11-10T18:30:00.000Z" },
];

describe("Comments", () => {
  it('has a section labeled "Comments"', () => {
    render(
      <Comments
        comments={comments}
        onDeleteComment={() => {}}
        onEditComment={() => {}}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Comments" })
    ).toBeInTheDocument();
  });

  it("shows every comment as an item of a list", () => {
    render(
      <Comments
        comments={comments}
        onDeleteComment={() => {}}
        onEditComment={() => {}}
      />
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows the text of each comment", () => {
    render(
      <Comments
        comments={comments}
        onDeleteComment={() => {}}
        onEditComment={() => {}}
      />
    );

    expect(screen.getByText("What a beautiful sky!")).toBeInTheDocument();
    expect(screen.getByText("I love the colors.")).toBeInTheDocument();
  });

  it("shows the date and time of each comment", () => {
    render(
      <Comments
        comments={comments}
        onDeleteComment={() => {}}
        onEditComment={() => {}}
      />
    );

    comments.forEach(({ date }) => {
      const time = screen.getByText(new Date(date).toLocaleString());
      expect(time).toHaveAttribute("datetime", date);
    });
  });

  it("renders no empty list when there are no comments", () => {
    render(
      <Comments
        comments={[]}
        onDeleteComment={() => {}}
        onEditComment={() => {}}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Comments" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("keeps the order of the comments", () => {
    render(
      <Comments
        comments={comments}
        onDeleteComment={() => {}}
        onEditComment={() => {}}
      />
    );

    const items = screen.getAllByRole("listitem");

    expect(items[0]).toHaveTextContent("What a beautiful sky!");
    expect(items[1]).toHaveTextContent("I love the colors.");
  });

  it("shows a Delete button on each comment", () => {
    render(
      <Comments
        comments={comments}
        onDeleteComment={() => {}}
        onEditComment={() => {}}
      />
    );

    const buttons = screen.getAllByRole("button", { name: /^Delete/ });

    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => expect(button).toHaveTextContent("Delete"));
  });

  it("names each Delete button after its comment", () => {
    render(
      <Comments
        comments={comments}
        onDeleteComment={() => {}}
        onEditComment={() => {}}
      />
    );

    expect(
      screen.getByRole("button", {
        name: "Delete comment: What a beautiful sky!",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Delete comment: I love the colors.",
      })
    ).toBeInTheDocument();
  });

  it("reports the id of the comment whose Delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDeleteComment = vi.fn();
    render(
      <Comments
        comments={comments}
        onDeleteComment={onDeleteComment}
        onEditComment={() => {}}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Delete comment: I love the colors." })
    );

    expect(onDeleteComment).toHaveBeenCalledTimes(1);
    expect(onDeleteComment).toHaveBeenCalledWith("c2");
  });

  it("reports the id of the right comment when two comments have the same text", async () => {
    const user = userEvent.setup();
    const onDeleteComment = vi.fn();
    const sameText: ArtPieceComment[] = [
      { id: "first", text: "Nice!", date: "2026-11-09T10:15:00.000Z" },
      { id: "second", text: "Nice!", date: "2026-11-09T10:16:00.000Z" },
    ];
    render(
      <Comments
        comments={sameText}
        onDeleteComment={onDeleteComment}
        onEditComment={() => {}}
      />
    );

    await user.click(screen.getAllByRole("button", { name: /^Delete/ })[1]);

    expect(onDeleteComment).toHaveBeenCalledWith("second");
  });
});

describe("Comments editing", () => {
  function renderComments(
    onEditComment: (id: string, text: string) => void = () => {},
    shownComments: ArtPieceComment[] = comments
  ) {
    render(
      <Comments
        comments={shownComments}
        onDeleteComment={() => {}}
        onEditComment={onEditComment}
      />
    );
  }

  it("shows an Edit button on each comment", () => {
    renderComments();

    const buttons = screen.getAllByRole("button", { name: /^Edit/ });

    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => expect(button).toHaveTextContent("Edit"));
    expect(
      screen.getByRole("button", {
        name: "Edit comment: What a beautiful sky!",
      })
    ).toBeInTheDocument();
  });

  it("shows a text field with the current text, Save and Cancel after Edit is clicked", async () => {
    const user = userEvent.setup();
    renderComments();

    await user.click(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    );

    expect(
      screen.getByRole("textbox", { name: /^Edit your comment/ })
    ).toHaveValue("I love the colors.");
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("tells the text fields apart when several comments are edited at once", async () => {
    const user = userEvent.setup();
    renderComments();

    await user.click(
      screen.getByRole("button", {
        name: "Edit comment: What a beautiful sky!",
      })
    );
    await user.click(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    );

    expect(
      screen.getByRole("textbox", {
        name: "Edit your comment: What a beautiful sky!",
      })
    ).toHaveValue("What a beautiful sky!");
    expect(
      screen.getByRole("textbox", {
        name: "Edit your comment: I love the colors.",
      })
    ).toHaveValue("I love the colors.");
  });

  it("moves the focus into the text field when the form opens", async () => {
    const user = userEvent.setup();
    renderComments();

    await user.click(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    );

    expect(
      screen.getByRole("textbox", {
        name: "Edit your comment: I love the colors.",
      })
    ).toHaveFocus();
  });

  it("does not take the focus before anything is edited", () => {
    renderComments();

    expect(document.body).toHaveFocus();
  });

  it("gives the focus back to the Edit button after Cancel", async () => {
    const user = userEvent.setup();
    renderComments();

    await user.click(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    ).toHaveFocus();
  });

  it("gives the focus back to the Edit button after Save", async () => {
    const user = userEvent.setup();
    renderComments();

    await user.click(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    );
    await user.type(
      screen.getByRole("textbox", {
        name: "Edit your comment: I love the colors.",
      }),
      " a lot"
    );
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    ).toHaveFocus();
  });

  it("gives the focus back after a Save without changes", async () => {
    const user = userEvent.setup();
    renderComments();

    await user.click(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    );
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    ).toHaveFocus();
  });

  it("leaves the other open form alone when one form is closed", async () => {
    const user = userEvent.setup();
    renderComments();

    await user.click(
      screen.getByRole("button", {
        name: "Edit comment: What a beautiful sky!",
      })
    );
    await user.click(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    );
    const otherField = screen.getByRole("textbox", {
      name: "Edit your comment: I love the colors.",
    });
    const [cancelOfFirstForm] = screen.getAllByRole("button", {
      name: "Cancel",
    });
    await user.click(cancelOfFirstForm);

    expect(
      screen.getByRole("button", {
        name: "Edit comment: What a beautiful sky!",
      })
    ).toHaveFocus();
    expect(otherField).toBeInTheDocument();
    expect(otherField).not.toHaveFocus();
    expect(otherField).toHaveValue("I love the colors.");
  });

  it("only edits the comment whose Edit button was clicked", async () => {
    const user = userEvent.setup();
    renderComments();

    await user.click(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    );

    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(
      screen.getByRole("button", {
        name: "Edit comment: What a beautiful sky!",
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit comment: I love the colors." })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Delete comment: I love the colors.",
      })
    ).not.toBeInTheDocument();
  });

  it("reports the id and the new text when Save is clicked, and closes the form", async () => {
    const user = userEvent.setup();
    const onEditComment = vi.fn();
    renderComments(onEditComment);

    await user.click(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    );
    const field = screen.getByRole("textbox", { name: /^Edit your comment/ });
    await user.clear(field);
    await user.type(field, "I adore the colors.");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onEditComment).toHaveBeenCalledTimes(1);
    expect(onEditComment).toHaveBeenCalledWith("c2", "I adore the colors.");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("keeps the old text and reports nothing when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onEditComment = vi.fn();
    renderComments(onEditComment);

    await user.click(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    );
    await user.type(
      screen.getByRole("textbox", { name: /^Edit your comment/ }),
      " a lot"
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onEditComment).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("I love the colors.")).toBeInTheDocument();
  });

  it("does not save an empty text and keeps the form open", async () => {
    const user = userEvent.setup();
    const onEditComment = vi.fn();
    renderComments(onEditComment);

    await user.click(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    );
    await user.clear(
      screen.getByRole("textbox", { name: /^Edit your comment/ })
    );
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onEditComment).not.toHaveBeenCalled();
    expect(
      screen.getByRole("textbox", { name: /^Edit your comment/ })
    ).toBeInTheDocument();
  });

  it("treats Save with an unchanged text like Cancel", async () => {
    const user = userEvent.setup();
    const onEditComment = vi.fn();
    renderComments(onEditComment);

    await user.click(
      screen.getByRole("button", { name: "Edit comment: I love the colors." })
    );
    await user.type(
      screen.getByRole("textbox", { name: /^Edit your comment/ }),
      "   "
    );
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onEditComment).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("does not count a Save without changes as an edit when the saved text has spaces around it", async () => {
    const user = userEvent.setup();
    const onEditComment = vi.fn();
    renderComments(onEditComment, [
      { id: "c9", text: "  padded  ", date: "2026-11-09T10:15:00.000Z" },
    ]);

    await user.click(screen.getByRole("button", { name: /^Edit comment/ }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onEditComment).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it('shows the label "edited" only on comments that were edited', () => {
    renderComments(() => {}, [
      { ...comments[0], edited: true },
      { ...comments[1] },
    ]);

    const items = screen.getAllByRole("listitem");

    expect(screen.getAllByText("edited")).toHaveLength(1);
    expect(items[0]).toHaveTextContent("edited");
    expect(items[1]).not.toHaveTextContent("edited");
  });

  it("hides the dot between the date and the label from screen readers", () => {
    renderComments(() => {}, [
      { ...comments[0], edited: true },
      { ...comments[1] },
    ]);

    expect(screen.getAllByText("·")).toHaveLength(1);
    expect(screen.getByText("·")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("edited")).not.toHaveAttribute("aria-hidden");
  });

  it("keeps the date and time next to the label of an edited comment", () => {
    renderComments(() => {}, [{ ...comments[0], edited: true }]);

    expect(
      screen.getByText(new Date(comments[0].date).toLocaleString())
    ).toHaveAttribute("datetime", comments[0].date);
  });
});
