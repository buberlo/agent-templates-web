import { ImageResponse } from "next/og";
import { getAllTemplates, getTemplate } from "@/lib/content/loader";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllTemplates().map((t) => ({ id: t.frontmatter.id }));
}

export default async function TemplateOgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = getTemplate(id);
  const title = doc?.frontmatter.title ?? "Agent template";
  const domain = doc?.frontmatter.domain ?? "";
  const risk = doc?.frontmatter.risk_level ?? "low";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#0b1220",
          color: "#f1f5f9",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span style={{ fontSize: 24, color: "#38bdf8" }}>Agent Templates</span>
        <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.15, maxWidth: 1000 }}>
          {title}
        </div>
        <div style={{ fontSize: 24, color: "#94a3b8" }}>
          {`${domain} · ${risk} risk`}
        </div>
      </div>
    ),
    { ...size },
  );
}