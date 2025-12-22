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
    const wrapper = showMoreButton.closest("span");

    expect(wrapper).not.toBeNull();
    expect(wrapper.textContent).toContain("...");

    fireEvent.click(showMoreButton);

    const showLessButton = screen.getByRole("button", { name: /show less/i });
    expect(showLessButton).toBeInTheDocument();
    expect(showLessButton.closest("span").textContent).toContain("word44");
  });
});
