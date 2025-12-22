import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { createElement } from "react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./msw/server";

process.env.TZ = "UTC";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

vi.mock("next/image", () => ({
  default: (props) => {
    const { fill, fetchPriority, priority, ...rest } = props ?? {};
    return createElement("img", {
      ...rest,
      alt: rest?.alt ?? "",
    });
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }) =>
    createElement(
      "a",
      {
        href: typeof href === "string" ? href : href?.pathname ?? "",
        ...rest,
      },
      children
    ),
}));
