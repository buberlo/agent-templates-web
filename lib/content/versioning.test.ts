import assert from "node:assert/strict";
import test from "node:test";
import { deriveVersionFromPath, resolveTemplateVersioning } from "./versioning";

test("deriveVersionFromPath prefers frontmatter", () => {
  assert.equal(deriveVersionFromPath("domains/x/foo-v2.md", "2.0.0"), "2.0.0");
});

test("deriveVersionFromPath reads filename suffix", () => {
  assert.equal(deriveVersionFromPath("domains/x/support-ticket-triage-reply-v1.md"), "v1");
  assert.equal(deriveVersionFromPath("domains/x/plan-v2.1.md"), "v2.1");
  assert.equal(deriveVersionFromPath("domains/x/no-suffix.md"), "v1");
});

test("resolveTemplateVersioning returns version and updated gracefully", () => {
  const result = resolveTemplateVersioning(
    "domains/customer-service/helpdesk-tickets/support-ticket-triage-reply-v1.md",
    "1.1.0",
    "2026-11-24",
  );
  assert.equal(result.version, "1.1.0");
  assert.match(result.updated, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(Array.isArray(result.changelog));
});