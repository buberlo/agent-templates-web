import { ImageResponse } from "next/og";
import { getAllTemplates } from "@/lib/content/loader";
import { templateOgLabels } from "@/lib/views/og-template";

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
  const content = templateOgLabels("en", id);

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
        <span style={{ fontSize: 24, color: "#38bdf8" }}>{content.brand}</span>
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 1000,
          }}
        >
          {content.title}
        </div>
        <div style={{ fontSize: 24, color: "#94a3b8" }}>{content.footer}</div>
      </div>
    ),
    { ...size },
  );
}