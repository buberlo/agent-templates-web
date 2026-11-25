import { buildTemplatesIndexJson } from "@/lib/content/api-payloads";

export const dynamic = "force-static";

export function GET() {
  return Response.json(buildTemplatesIndexJson(), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
