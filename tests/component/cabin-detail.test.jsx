import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Cabin from "../../app/_components/Cabin";

const cabin = {
  id: 1,
  name: "Aspen",
  maxCapacity: 4,
  regularPrice: 300,
  discount: 50,
  image: "/aspen.jpg",
  description: "A cozy cabin in the mountains.",
};

describe("Cabin", () => {
  it("renders cabin details with an accessible image", () => {
    render(<Cabin cabin={cabin} />);

    expect(
      screen.getByRole("img", { name: /cabin aspen/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/cabin aspen/i)).toBeInTheDocument();
    expect(screen.getByText(/4/)).toBeInTheDocument();
  });
});
