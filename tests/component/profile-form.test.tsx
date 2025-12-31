import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("../../app/_lib/actions", () => ({
  updateGuest: vi.fn(),
}));

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingLabel?: string;
  [key: string]: unknown;
}

vi.mock("../../app/_components/SubmitButton", () => ({
  default: ({ children, pendingLabel, ...props }: SubmitButtonProps) => (
    <button {...props}>{children}</button>
  ),
}));

interface GuestData {
  fullName: string;
  email: string;
  nationality?: string;
  nationalID?: string;
  countryFlag?: string;
}

const guest: GuestData = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  nationality: "Japan",
  nationalID: "ABC123",
  countryFlag: "",
};

async function renderForm(overrides: Partial<GuestData> = {}) {
  const { default: UpdateProfileForm } = await import(
    "../../app/_components/UpdateProfileForm"
  );

  const mergedGuest = { ...guest, ...overrides };

  return render(
    <UpdateProfileForm guest={mergedGuest}>
      <select id="nationality" name="nationality">
        <option value="">Select country...</option>
        <option value="Japan%flag">Japan</option>
      </select>
    </UpdateProfileForm>
  );
}

describe("UpdateProfileForm", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("connects labels to inputs and disables profile fields", async () => {
    await renderForm();

    expect(screen.getByLabelText(/full name/i)).toBeDisabled();
    expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    expect(screen.getByLabelText(/where are you from\?/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/national id number/i)
    ).toBeInTheDocument();
  });

  it("shows a validation error for invalid national ID", async () => {
    await renderForm();

    const nationalIdInput = screen.getByLabelText(/national id number/i);
    fireEvent.change(nationalIdInput, { target: { value: "123" } });

    const submitButton = screen.getByRole("button", {
      name: /update profile/i,
    });
    const form = submitButton.closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /national id must be 6/i
    );
  });

  it("allows an empty national ID without an error", async () => {
    await renderForm({ nationalID: "" });

    const submitButton = screen.getByRole("button", {
      name: /update profile/i,
    });
    const form = submitButton.closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
