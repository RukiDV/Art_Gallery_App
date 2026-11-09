import { render, screen } from "@testing-library/react";

import type { ArtPieceComment } from "../types";
import Comments from "./Comments";

const comments: ArtPieceComment[] = [
  { text: "What a beautiful sky!", date: "2026-11-09T10:15:00.000Z" },
  { text: "I love the colors.", date: "2026-11-10T18:30:00.000Z" },
];

describe("Comments", () => {
  it('has a section labeled "Comments"', () => {
    render(<Comments comments={comments} />);

    expect(
      screen.getByRole("heading", { name: "Comments" })
    ).toBeInTheDocument();
  });

  it("shows every comment as an item of a list", () => {
    render(<Comments comments={comments} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("shows the text of each comment", () => {
    render(<Comments comments={comments} />);

    expect(screen.getByText("What a beautiful sky!")).toBeInTheDocument();
    expect(screen.getByText("I love the colors.")).toBeInTheDocument();
  });

  it("shows the date and time of each comment", () => {
    render(<Comments comments={comments} />);

    comments.forEach(({ date }) => {
      const time = screen.getByText(new Date(date).toLocaleString());
      expect(time).toHaveAttribute("datetime", date);
    });
  });

  it("renders no empty list when there are no comments", () => {
    render(<Comments comments={[]} />);

    expect(
      screen.getByRole("heading", { name: "Comments" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("keeps the order of the comments", () => {
    render(<Comments comments={comments} />);

    const items = screen.getAllByRole("listitem");

    expect(items[0]).toHaveTextContent("What a beautiful sky!");
    expect(items[1]).toHaveTextContent("I love the colors.");
  });
});
