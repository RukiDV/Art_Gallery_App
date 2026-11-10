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
    render(<Comments comments={comments} onDeleteComment={() => {}} />);

    expect(
      screen.getByRole("heading", { name: "Comments" })
    ).toBeInTheDocument();
  });

  it("shows every comment as an item of a list", () => {
    render(<Comments comments={comments} onDeleteComment={() => {}} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows the text of each comment", () => {
    render(<Comments comments={comments} onDeleteComment={() => {}} />);

    expect(screen.getByText("What a beautiful sky!")).toBeInTheDocument();
    expect(screen.getByText("I love the colors.")).toBeInTheDocument();
  });

  it("shows the date and time of each comment", () => {
    render(<Comments comments={comments} onDeleteComment={() => {}} />);

    comments.forEach(({ date }) => {
      const time = screen.getByText(new Date(date).toLocaleString());
      expect(time).toHaveAttribute("datetime", date);
    });
  });

  it("renders no empty list when there are no comments", () => {
    render(<Comments comments={[]} onDeleteComment={() => {}} />);

    expect(
      screen.getByRole("heading", { name: "Comments" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("keeps the order of the comments", () => {
    render(<Comments comments={comments} onDeleteComment={() => {}} />);

    const items = screen.getAllByRole("listitem");

    expect(items[0]).toHaveTextContent("What a beautiful sky!");
    expect(items[1]).toHaveTextContent("I love the colors.");
  });

  it("shows a Delete button on each comment", () => {
    render(<Comments comments={comments} onDeleteComment={() => {}} />);

    const buttons = screen.getAllByRole("button", { name: /^Delete/ });

    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => expect(button).toHaveTextContent("Delete"));
  });

  it("names each Delete button after its comment", () => {
    render(<Comments comments={comments} onDeleteComment={() => {}} />);

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
    render(<Comments comments={comments} onDeleteComment={onDeleteComment} />);

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
    render(<Comments comments={sameText} onDeleteComment={onDeleteComment} />);

    await user.click(screen.getAllByRole("button", { name: /^Delete/ })[1]);

    expect(onDeleteComment).toHaveBeenCalledWith("second");
  });
});
