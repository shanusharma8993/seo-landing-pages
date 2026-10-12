import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };

export function renderOgImage({ title, subtitle }: { title: string; subtitle: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 100%)",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 700, opacity: 0.9 }}>{siteConfig.name}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
          <div style={{ fontSize: 32, opacity: 0.9 }}>{subtitle}</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
