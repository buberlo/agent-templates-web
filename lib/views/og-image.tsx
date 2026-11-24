import { ImageResponse } from "next/og";

export function catalogOgImage(
  { brand, title, caption }: { brand: string; title: string; caption: string },
  size: { width: number; height: number },
) {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", background: "#0f1b18", color: "#eff5eb", padding: 68 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 760, height: 494, padding: "18px 34px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, color: "#ceed83" }}>
            <span style={{ display: "flex", justifyContent: "center", alignItems: "center", borderRadius: 12, width: 52, height: 52, background: "#ceed83", color: "#0f1b18" }}>{"{ }"}</span>
            {brand}
          </div>
          <div style={{ fontSize: title.length > 58 ? 58 : 74, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.045em" }}>{title}</div>
          <div style={{ display: "flex", borderTop: "1px solid #3f5850", paddingTop: 22, fontSize: 23, color: "#b0c4b7" }}>{caption}</div>
        </div>
        <div style={{ display: "flex", position: "absolute", right: 68, top: 68, bottom: 68, width: 250, border: "1px solid #486451", borderRadius: 20, background: "linear-gradient(145deg, #142b22, #385b37)", justifyContent: "center", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", width: 176, height: 224, background: "#11251d", border: "1px solid #718d72", borderRadius: 13, boxShadow: "8px 8px #83945c", transform: "rotate(-8deg)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "8px 14px", background: "#203a2d", color: "#ceed83", fontSize: 20 }}>{"{ }"}</div>
            {[95, 68, 110].map((width) => (
              <div key={width} style={{ display: "flex", flexDirection: "column", gap: 9, margin: "13px 14px 0" }}>
                <div style={{ width: 26, height: 6, borderRadius: 3, background: "#ceed83" }} />
                <div style={{ width, height: 6, borderRadius: 3, background: "#547460" }} />
                <div style={{ width: 51, height: 6, borderRadius: 3, background: "#3e5b48" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
