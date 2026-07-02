import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#080808",
          color: "#f4f4f5",
          display: "flex",
          fontSize: 236,
          fontWeight: 600,
          height: "100%",
          justifyContent: "center",
          letterSpacing: "-12px",
          width: "100%",
        }}
      >
        MC
      </div>
    ),
    { ...size },
  );
}
