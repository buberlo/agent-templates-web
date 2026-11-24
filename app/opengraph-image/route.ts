import { catalogOgImage } from "@/lib/views/og-image";
import { ogHomeContent } from "@/lib/views/og-home";

export const dynamic = "force-static";
export const runtime = "nodejs";
const size = { width: 1200, height: 630 };

export function GET() {
  const { brand, title, stats } = ogHomeContent("en");
  return catalogOgImage({ brand, title, caption: stats }, size);
}
