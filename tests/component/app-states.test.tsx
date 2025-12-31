import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ErrorState from "../../app/error";
import NotFound from "../../app/not-found";
import CabinsLoading from "../../app/cabins/loading";

describe("App UI states", () => {
  it("renders the error state and triggers reset", () => {
    const reset = vi.fn();
    render(<ErrorState error={new Error("Boom")} reset={reset} />);

    expect(
      screen.getByRole("heading", { name: /something went wrong/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Boom")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("renders the not-found state", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { name: /could not be found/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go back home/i })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("renders the cabins loading state", () => {
    render(<CabinsLoading />);

    expect(screen.getByText(/loading cabin data/i)).toBeInTheDocument();
  });
});
