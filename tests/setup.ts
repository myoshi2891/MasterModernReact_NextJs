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

interface MockImageProps {
  alt?: string;
  fill?: unknown;
  fetchPriority?: unknown;
  priority?: unknown;
  [key: string]: unknown;
}

vi.mock("next/image", () => ({
  default: (props: MockImageProps) => {
    const { fill, fetchPriority, priority, alt = "", ...rest } = props ?? {};
    return createElement("img", {
      ...rest,
      alt,
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