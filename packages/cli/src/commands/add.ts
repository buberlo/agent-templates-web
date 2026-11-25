import fs from "node:fs";
import type { ExportTarget } from "@/lib/content/constants";
import { exportTemplate } from "@/lib/export";
import type { Content } from "../content";
import { instructionPath, writeInstructions } from "../destinations";

export function add(content: Content, id: string, target: ExportTarget, stdout: boolean, dryRun: boolean) {
  const result = exportTemplate(content.find(id), target);
  if (stdout) {
    process.stdout.write(result.content);
    return;
  }

  const relative = instructionPath(target, result.filename);
  console.log(writeInstructions(fs.realpathSync(process.cwd()), relative, result.content, dryRun));
  if (target === "grokbot") console.log("Paste the setup message into a new Grok Bot.");
  if (target === "hermes" || target === "openclaw") {
    console.log("Place the export as SKILL.md in the agent's skill directory.");
  }
}
