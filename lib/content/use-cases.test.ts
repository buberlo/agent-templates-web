import assert from "node:assert/strict";
import test from "node:test";
import { listUseCaseLandings, USE_CASE_MIN_TEMPLATES } from "./use-cases";

test("use case landings require at least three templates per agent/domain pair", () => {
  const landings = listUseCaseLandings("en");
  assert.ok(landings.length > 0, "expected at least one landing from live catalog");
  for (const landing of landings) {
    assert.ok(landing.templates.length >= USE_CASE_MIN_TEMPLATES);
    assert.match(landing.intro, new RegExp(landing.templates.length.toString()));
    assert.ok(landing.canonicalPath.startsWith("/use-cases/"));
  }
});