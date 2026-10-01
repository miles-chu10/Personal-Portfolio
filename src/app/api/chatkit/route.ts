import { proxyChatKit } from "@/lib/chatkit-proxy";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  return proxyChatKit(request, {
    backendUrl: process.env.CHATKIT_BACKEND_URL?.trim() || "",
    token: process.env.CHATKIT_BACKEND_TOKEN?.trim() || "",
    enabled: !["false", "0", "off", "no"].includes(process.env.CHAT_ENABLED?.trim().toLowerCase() || ""),
    // Services use internal hosts. These origins come from deployment settings,
    // rather than a caller's forwarded-host header.
    allowedOrigins: [
      process.env.NEXT_PUBLIC_SITE_URL,
      ...[process.env.VERCEL_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_BRANCH_URL]
        .filter(Boolean).map((host) => `https://${host}`),
    ].filter((value): value is string => Boolean(value)),
  });
}
