import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://restcountries.com/v3.1/all", () => {
    return HttpResponse.json([
      {
        name: { common: "Japan" },
        flags: { svg: "jp.svg" },
      },
      {
        name: { common: "" },
        flags: { png: "empty.png" },
      },
    ]);
  }),
];
