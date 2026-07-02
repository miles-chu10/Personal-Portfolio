import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  earlier,
  footerLinks,
  impactRows,
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
    assert.ok(!Object.values(profile).some((value) => /\d{3}[-). ]+\d{3}/.test(value)));
  });

  it("has enough rows for the Ambrosino-style sections", () => {
    assert.ok(latest.length >= 3);
    assert.ok(earlier.length >= 2);
    assert.ok(impactRows.length >= 4);
    assert.ok(skillRows.length >= 4);
    assert.ok(miscLinks.length >= 3);
  });

  it("keeps timeline rows display-ready", () => {
    for (const row of [...latest, ...earlier]) {
      assert.ok(row.organization.length > 0);
      assert.ok(row.logo.src.startsWith("/img/logos/"));
      assert.ok(row.logo.src.endsWith(".svg"));
      assert.ok(row.logo.alt.length > 0);
      assert.ok(row.roles.length > 0);
      assert.ok(row.roles.every((role) => role.title && role.period));
    }
  });

  it("keeps impact rows concise and metric-led", () => {
    for (const row of impactRows) {
      assert.ok(row.metric.length > 0);
      assert.ok(row.label.length > 0);
      assert.ok(row.detail.length > 30);
      assert.ok(row.detail.length < 140);
    }
  });

  it("keeps misc links distinct", () => {
    assert.equal(new Set(miscLinks.map((link) => link.href)).size, miscLinks.length);
  });

  it("keeps footer links compact and resolvable", () => {
    assert.ok(footerLinks.length >= 4);
    assert.ok(footerLinks.every((link) => link.label && link.shortLabel));
    assert.ok(
      footerLinks.every(
        (link) =>
          link.href.startsWith("https://") ||
          link.href.startsWith("#") ||
          link.href.startsWith("/") ||
          link.href.startsWith("mailto:"),
      ),
    );
  });
});
