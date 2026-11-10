import { render, screen, within } from "@testing-library/react";

import type { ArtPieceCommentVersion } from "../types";
import CommentHistory from "./CommentHistory";

const history: ArtPieceCommentVersion[] = [
  { text: "The first version", replacedAt: "2026-11-10T09:00:00.000Z" },
  { text: "The second version", replacedAt: "2026-11-10T10:30:00.000Z" },
  { text: "The third version", replacedAt: "2026-11-11T08:15:00.000Z" },
];

describe("CommentHistory", () => {
  it("shows the earlier versions as a list with one item per version", () => {
    render(<CommentHistory history={history} />);

    const list = screen.getByRole("list", { name: "Earlier versions" });

    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });

  it("shows the text of every version", () => {
    render(<CommentHistory history={history} />);

    history.forEach(({ text }) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it("keeps the order of the versions, oldest first", () => {
    render(<CommentHistory history={history} />);

    const items = screen.getAllByRole("listitem");

    expect(items[0]).toHaveTextContent("The first version");
    expect(items[1]).toHaveTextContent("The second version");
    expect(items[2]).toHaveTextContent("The third version");
  });

  it("shows when each version was replaced", () => {
    render(<CommentHistory history={history} />);

    history.forEach(({ replacedAt }) => {
      const time = screen.getByText(new Date(replacedAt).toLocaleString());
      expect(time).toHaveAttribute("datetime", replacedAt);
    });
    expect(screen.getAllByText(/^Replaced/)).toHaveLength(3);
  });

  it('says "No earlier versions saved" when there is no version', () => {
    render(<CommentHistory history={[]} />);

    expect(screen.getByText("No earlier versions saved")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("does not say that there are no versions when there are some", () => {
    render(<CommentHistory history={history} />);

    expect(
      screen.queryByText("No earlier versions saved")
    ).not.toBeInTheDocument();
  });
});
