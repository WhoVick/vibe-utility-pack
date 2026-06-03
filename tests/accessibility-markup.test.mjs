import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

function tags(name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

function hasAccessibleName(tag) {
  const id = tag.match(/\sid="([^"]+)"/)?.[1];
  return /\saria-label=/.test(tag)
    || /\saria-labelledby=/.test(tag)
    || (id && new RegExp(`<label\\b[^>]*for="${id}"`, "i").test(html));
}

test("page includes skip link and tablist landmarks", () => {
  assert.match(html, /class="skip-link"/);
  assert.match(html, /<main class="workspace" id="workspace"/);
  assert.match(html, /role="tablist"/);
});

test("form controls have accessible names", () => {
  const controls = [...tags("input"), ...tags("textarea")].filter((tag) => !/type="checkbox"/.test(tag));
  const missing = controls.filter((tag) => !hasAccessibleName(tag));
  assert.deepEqual(missing, []);
});

test("interactive canvas and focus states are keyboard visible", () => {
  assert.match(html, /<canvas[^>]+tabindex="0"[^>]+aria-label=/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /\.skip-link:focus/);
});
