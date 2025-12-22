import { describe, it, expect, vi, afterEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DeleteReservation from "../../app/_components/DeleteReservation";

describe("DeleteReservation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not call onDelete when confirmation is canceled", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const onDelete = vi.fn();

    render(<DeleteReservation bookingId={5} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("calls onDelete when confirmation is accepted", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const onDelete = vi.fn();

    render(<DeleteReservation bookingId={7} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith(7);
  });
});
