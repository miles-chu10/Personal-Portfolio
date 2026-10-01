import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getSiteUrl } from "./site";

const KEYS = ["NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL"] as const;

function withSiteEnv(
  values: Partial<Record<(typeof KEYS)[number], string>>,
  run: () => void,
) {
  const saved = KEYS.map((key) => [key, process.env[key]] as const);

  for (const key of KEYS) {
    const value = values[key];

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    run();
  } finally {
    for (const [key, value] of saved) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

describe("getSiteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL and trims trailing slashes", () => {
    withSiteEnv(
      {
        NEXT_PUBLIC_SITE_URL: "https://milesdchu.com//",
        VERCEL_PROJECT_PRODUCTION_URL: "old-name.vercel.app",
      },
      () => assert.equal(getSiteUrl(), "https://milesdchu.com"),
    );
  });

  it("ignores a blank NEXT_PUBLIC_SITE_URL", () => {
    withSiteEnv(
      {
        NEXT_PUBLIC_SITE_URL: "   ",
        VERCEL_PROJECT_PRODUCTION_URL: "milesdchu.com",
      },
      () => assert.equal(getSiteUrl(), "https://milesdchu.com"),
    );
  });

  it("falls back to the Vercel production host", () => {
    withSiteEnv({ VERCEL_PROJECT_PRODUCTION_URL: "milesdchu.com" }, () =>
      assert.equal(getSiteUrl(), "https://milesdchu.com"),
    );
  });

  it("falls back to localhost when nothing is configured", () => {
    withSiteEnv({}, () => assert.equal(getSiteUrl(), "http://localhost:3000"));
  });
});
