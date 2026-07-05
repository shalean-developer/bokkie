import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addHeadingIdsToHtml, sanitizeBlogHtml } from "./sanitize-blog-html";

describe("sanitizeBlogHtml", () => {
  it("removes script tags", () => {
    const result = sanitizeBlogHtml('<p>Hello</p><script>alert(1)</script>');
    assert.equal(result.includes("<script"), false);
    assert.match(result, /<p>Hello<\/p>/);
  });

  it("removes javascript: links", () => {
    const result = sanitizeBlogHtml('<a href="javascript:alert(1)">bad</a>');
    assert.equal(result.includes("javascript:"), false);
  });

  it("adds rel and target on external links", () => {
    const result = sanitizeBlogHtml(
      '<a href="https://example.com">Example</a>'
    );
    assert.match(result, /rel="noopener noreferrer"/);
    assert.match(result, /target="_blank"/);
  });

  it("preserves allowed headings and lists", () => {
    const html = "<h2>Title</h2><ul><li>One</li></ul>";
    const result = sanitizeBlogHtml(html);
    assert.match(result, /<h2>Title<\/h2>/);
    assert.match(result, /<ul><li>One<\/li><\/ul>/);
  });

  it("adds id attributes to headings for anchors", () => {
    const html =
      '<h2><span>What Is the Average House Cleaning Cost in Cape Town?</span></h2>';
    const result = addHeadingIdsToHtml(html);
    assert.match(
      result,
      /<h2 id="what-is-the-average-house-cleaning-cost-in-cape-town">/
    );
  });
});
