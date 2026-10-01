import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { earlier, latest } from "@/data/portfolio";
import { formatPeriod } from "@/lib/format-period";

import Home from "./page";

function renderHome() {
  return renderToStaticMarkup(createElement(Home));
}

describe("homepage static render", () => {
  it("keeps the resume and professional profile but removes the repository dock link", () => {
    const markup = renderHome();
    const downloadControl =
      markup.match(/<a[^>]*aria-label="Download resume \(PDF\)"[^>]*>/)?.[0] ?? "";

    assert.notEqual(downloadControl, "");
    assert.match(downloadControl, /href="\/Miles_Chu_Resume\.pdf"/);
    assert.match(downloadControl, /download="Miles_Chu_Resume\.pdf"/);
    assert.match(markup, />PDF<\/span>/);
    assert.doesNotMatch(markup, /aria-label="Source code"/);
    assert.doesNotMatch(markup, /href="https:\/\/github\.com\/miles-chu10\/Personal-Portfolio"/);
    assert.match(markup, /href="https:\/\/github\.com\/miles-chu10"/);
  });

  it("keeps a period associated with every role when duplicate dates are hidden visually", () => {
    const markup = renderHome().replaceAll("&#x27;", "'");
    const roles = [...latest, ...earlier].flatMap((item) => item.roles);
    const expected = new Map<string, number>();

    for (const role of roles) {
      const period = formatPeriod(role.period);
      expected.set(period, (expected.get(period) ?? 0) + 1);
    }

    for (const [period, count] of expected) {
      assert.equal(markup.split(period).length - 1, count, period);
    }

    const repeated = [...latest, ...earlier]
      .flatMap((item) => item.roles.filter((role, index) => index > 0 && role.period === item.roles[index - 1].period))
      .at(0);

    assert.ok(repeated, "fixture: at least one organization repeats a period");
    assert.match(markup, new RegExp(`<p class="sr-only">${formatPeriod(repeated.period)}</p>`));
  });
});
