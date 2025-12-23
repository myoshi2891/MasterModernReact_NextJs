import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TextExpander from "../../app/_components/TextExpander";

const longText = Array.from({ length: 45 }, (_, index) => `word${index}`).join(
  " "
);

describe("TextExpander", () => {
  it("toggles the expanded text", () => {
    render(<TextExpander>{longText}</TextExpander>);

    const showMoreButton = screen.getByRole("button", { name: /show more/i });
    expect(screen.getByText(/\.\.\./)).toBeInTheDocument();

    fireEvent.click(showMoreButton);

    const showLessButton = screen.getByRole("button", { name: /show less/i });
    expect(showLessButton).toBeInTheDocument();
    expect(screen.getByText(/word44/)).toBeInTheDocument();
  });
});
