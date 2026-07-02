import type { MetadataRoute } from "next";

import { profile } from "@/data/portfolio";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${profile.name} Portfolio`,
    short_name: profile.name,
    description:
      "Personal portfolio for Miles Chu, covering growth strategy, revenue operations, and AI workflow systems.",
    start_url: "/",
    display: "standalone",
    background_color: "#080808",
    theme_color: "#080808",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
