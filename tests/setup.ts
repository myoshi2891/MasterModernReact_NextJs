import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
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
  default: (props: Record<string, unknown>) => {
    const { fill, fetchPriority, priority, alt = "", ...rest } = props ?? {};
    return createElement("img", {
      ...rest,
      alt: alt as string,
    });
  },
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string | { pathname?: string };
    children: ReactNode;
    [key: string]: unknown;
  }) =>
    createElement(
      "a",
      {
        href: typeof href === "string" ? href : href?.pathname ?? "",
        ...rest,
      },
      children
    ),
}));
