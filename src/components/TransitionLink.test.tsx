import { addTransitionType } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

import TransitionLink, { OPEN_DETAILS_TRANSITION } from "./TransitionLink";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, addTransitionType: vi.fn(actual.addTransitionType) };
});

afterEach(() => {
  vi.clearAllMocks();
});

function Where() {
  return <p>{`At ${useLocation().pathname}`}</p>;
}

function renderLink() {
  render(
    <MemoryRouter initialEntries={["/start"]}>
      <TransitionLink to="/target">Open</TransitionLink>
      <Routes>
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>
  );
  return screen.getByRole("link", { name: "Open" });
}

describe("TransitionLink", () => {
  it("is a link to its target", () => {
    expect(renderLink()).toHaveAttribute("href", "/target");
  });

  it("goes to the target when it is clicked", () => {
    fireEvent.click(renderLink());

    expect(screen.getByText("At /target")).toBeInTheDocument();
  });

  it("marks the navigation as opening the details, so the picture may glide", () => {
    fireEvent.click(renderLink());

    expect(addTransitionType).toHaveBeenCalledWith(OPEN_DETAILS_TRANSITION);
  });

  it.each([
    ["ctrl", { ctrlKey: true }],
    ["meta", { metaKey: true }],
    ["shift", { shiftKey: true }],
    ["middle button", { button: 1 }],
  ])(
    "leaves a click with %s to the browser: no navigation and no glide",
    (_name, eventInit) => {
      fireEvent.click(renderLink(), eventInit);

      expect(screen.getByText("At /start")).toBeInTheDocument();
      expect(addTransitionType).not.toHaveBeenCalled();
    }
  );
});
