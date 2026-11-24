import assert from "node:assert/strict";
import { test } from "node:test";
import {
  agentFromParam,
  agentLabel,
  agentToParam,
  normalizeAgentId,
  templateSupportsAgent,
  uniqueAgentIds,
} from "./agents";

test("normalizes Grok Bot aliases to grokbot", () => {
  for (const value of ["grokbot", "grok-bot", "Grok Bot", "GrokBot", "GROK-BOT", "grok"]) {
    assert.equal(normalizeAgentId(value), "grokbot");
  }
});

test("does not collapse generic and generic-mcp-agents", () => {
  assert.equal(normalizeAgentId("generic"), "generic");
  assert.equal(normalizeAgentId("generic-mcp-agents"), "generic-mcp-agents");
  assert.equal(normalizeAgentId("Generic MCP agents"), "generic-mcp-agents");
});

test("round-trips the shareable Grok Bot query param", () => {
  assert.equal(agentToParam("grokbot"), "grok-bot");
  assert.equal(agentFromParam("grok-bot"), "grokbot");
  assert.equal(agentFromParam("Grok Bot"), "grokbot");
  assert.equal(agentFromParam("grokbot"), "grokbot");
});

test("uniqueAgentIds groups aliases and filter matching is alias-tolerant", () => {
  assert.deepEqual(uniqueAgentIds(["Grok Bot", "grok-bot", "hermes"]), ["grokbot", "hermes"]);
  assert.equal(templateSupportsAgent(["grokbot", "hermes"], "Grok Bot"), true);
  assert.equal(templateSupportsAgent(["Grok Bot"], "grok-bot"), true);
  assert.equal(templateSupportsAgent(["hermes"], "grokbot"), false);
});

test("agentLabel prefers dictionary labels for Grok Bot", () => {
  assert.equal(agentLabel("grokbot", { grokbot: "Grok Bot" }), "Grok Bot");
  assert.equal(agentLabel("grok-bot"), "Grok Bot");
});
