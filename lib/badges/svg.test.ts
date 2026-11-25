import assert from "node:assert/strict";
import test from "node:test";
import { agentStencilBadgeSvg, qualityBadgeSvg } from "./svg";

test("agentStencilBadgeSvg escapes XML and includes title", () => {
  const svg = agentStencilBadgeSvg('Test & "badge"');
  assert.match(svg, /AgentStencil/);
  assert.match(svg, /Test &amp; &quot;badge&quot;/);
  assert.match(svg, /^<\?xml/);
});

test("qualityBadgeSvg encodes score", () => {
  const svg = qualityBadgeSvg("passes", 12, 12);
  assert.match(svg, /12\/12/);
  assert.match(svg, /Quality passes/);
});