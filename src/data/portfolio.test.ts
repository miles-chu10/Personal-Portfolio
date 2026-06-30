import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  earlier,
  footerLinks,
  latest,
  miscLinks,
  profile,
  skillRows,
} from "./portfolio";

describe("portfolio content", () => {
  it("defines the identity fields used by the homepage", () => {
    assert.equal(profile.name, "Miles Chu");
    assert.match(profile.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    assert.ok(profile.title.length > 20);
  });

  it("has enough rows for the Ambrosino-style sections", () => {
    assert.ok(latest.length >= 3);
    assert.ok(earlier.length >= 3);
    assert.ok(skillRows.length >= 4);
    assert.ok(miscLinks.length >= 3);
  });

  it("keeps timeline rows display-ready", () => {
    for (const row of [...latest, ...earlier]) {
      assert.ok(row.organization.length > 0);
      assert.ok(row.mark.length > 0);
      assert.match(row.markTone, /^#[0-9a-f]{6}$/i);
      assert.ok(row.roles.length > 0);
      assert.ok(row.roles.every((role) => role.title && role.period));
    }
  });

  it("keeps footer links compact and resolvable", () => {
    assert.ok(footerLinks.length >= 4);
    assert.ok(footerLinks.every((link) => link.label && link.shortLabel));
    assert.ok(
      footerLinks.every(
        (link) => link.href.startsWith("https://") || link.href.startsWith("#") || link.href.startsWith("mailto:"),
      ),
    );
  });
});
