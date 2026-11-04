import { ImageResponse } from "next/og";

/**
 * Share image (Open Graph, 1200x630) used by every page: what WhatsApp, LinkedIn, Facebook
 * and Slack show when a link to the site is shared (UX audit I6; exception to the SEO guide's
 * meta tag rule approved by Lucas on 28/10/2026). Generated at build time.
 */
export const alt = "M&S Electric, commercial electrical contractor in Kansas City";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#1a1a1a",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 6, background: "#e5161e" }} />
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 4, color: "#e5161e" }}>M&amp;S ELECTRIC</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>Commercial Electrical Contractor in Kansas City</div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.8)" }}>
            Commercial electrical · Fire alarm · Low voltage · Maintenance &amp; service
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "rgba(255,255,255,0.85)" }}>
          <div>(816) 427-5913</div>
          <div>mandselectric.net · Since 2011</div>
        </div>
      </div>
    ),
    size,
  );
}
