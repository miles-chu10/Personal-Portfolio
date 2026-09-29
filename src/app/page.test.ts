import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import Home from "./page";

function renderHome() {
  return renderToStaticMarkup(createElement(Home));
}

describe("homepage static render", () => {
  it("keeps the PDF and GitHub dock controls discoverable by name", () => {
    const markup = renderHome();
    const downloadControl =
      markup.match(/<a[^>]*aria-label="Download resume"[^>]*>/)?.[0] ?? "";
    const sourceControl =
      markup.match(/<a[^>]*aria-label="Source code"[^>]*>/)?.[0] ?? "";

    assert.notEqual(downloadControl, "");
    assert.match(downloadControl, /href="\/Miles_Chu_Resume\.pdf"/);
    assert.match(downloadControl, /download="Miles_Chu_Resume\.pdf"/);
    assert.match(markup, />PDF<\/span>/);
    assert.notEqual(sourceControl, "");
    assert.match(
      sourceControl,
      /href="https:\/\/github\.com\/miles-chu10\/Personal-Portfolio"/,
    );
    assert.match(markup, /<span[^>]*>Source code<\/span>/);
  });

  it("keeps a period associated with every role when duplicate dates are hidden visually", () => {
    const markup = renderHome().replaceAll("&#x27;", "'");
    const openAiPeriod = "Oct\u00a0'25 - Feb\u00a0'26";
    const occurrences = markup.split(openAiPeriod).length - 1;

    assert.equal(occurrences, 2);
    assert.match(markup, new RegExp(`<p class="sr-only">${openAiPeriod}</p>`));
    assert.match(
      markup,
      new RegExp(`AI-assisted operating workflows[\\s\\S]*?${openAiPeriod}`),
    );
  });
});
