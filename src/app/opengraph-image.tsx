import { ImageResponse } from "next/og";

import { profile } from "@/data/portfolio";

export const alt = `${profile.name} - ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#080808",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "flex-end",
          padding: "80px",
          width: "100%",
        }}
      >
        <div
          style={{
            borderTop: "1px solid #27272a",
            display: "flex",
            flexDirection: "column",
            gap: "26px",
            paddingTop: "44px",
          }}
        >
          <div style={{ color: "#f4f4f5", fontSize: 76, fontWeight: 600 }}>
            {profile.name}
          </div>
          <div style={{ color: "#8a8a8f", fontSize: 34 }}>{profile.title}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
