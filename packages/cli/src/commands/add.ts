import fs from "node:fs";
import type { ExportTarget } from "@/lib/content/constants";
import { allExportFiles, exportTemplate } from "@/lib/export";
import type { Content } from "../content";
import { instructionPath, writeInstructions } from "../destinations";

export function add(content: Content, id: string, target: ExportTarget, stdout: boolean, dryRun: boolean) {
  const result = exportTemplate(content.find(id), target);
  if (stdout) {
    process.stdout.write(result.content);
    if (result.extraFiles?.length) {
      console.error(
        `Note: ${target} also generates ${result.extraFiles.map((f) => f.filename).join(", ")}. Omit --stdout to write every file.`,
      );
    }
    return;
  }

  const root = fs.realpathSync(process.cwd());
  for (const file of allExportFiles(result)) {
    const relative = instructionPath(target, file.filename);
    console.log(writeInstructions(root, relative, file.content, dryRun));
  }
  if (target === "grokbot") console.log("Paste the setup message into a new Grok Bot.");
  if (target === "hermes") {
    console.log(
      "Place as ~/.hermes/skills/<name>/SKILL.md. Frontmatter name must match the folder.",
    );
  }
  if (target === "openclaw") {
    console.log("Place the export as SKILL.md in the agent's skill directory.");
  }
}
