import { ImageResponse } from "next/og";
import { ogHomeContent } from "@/lib/views/og-home";

export const runtime = "nodejs";
export const alt = "Agent Templates";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  const content = ogHomeContent("en");
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: 80,
          background: "linear-gradient(135deg, #0b1220 0%, #0f2744 100%)",
          color: "#e8f4ff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span style={{ fontSize: 28, color: "#38bdf8" }}>{content.brand}</span>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            marginTop: 16,
            lineHeight: 1.1,
          }}
        >
          {content.title}
        </div>
        <div style={{ fontSize: 28, marginTop: 24, color: "#94a3b8" }}>
          {content.stats}
        </div>
      </div>
    ),
    { ...size },
  );
}