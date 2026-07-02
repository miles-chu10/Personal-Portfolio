import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#080808",
          color: "#f4f4f5",
          display: "flex",
          fontSize: 84,
          fontWeight: 600,
          height: "100%",
          justifyContent: "center",
          letterSpacing: "-4px",
          width: "100%",
        }}
      >
        MC
      </div>
    ),
    { ...size },
  );
}
