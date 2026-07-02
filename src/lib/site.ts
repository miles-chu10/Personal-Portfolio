export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (vercelProductionHost) {
    return `https://${vercelProductionHost}`;
  }

  return "http://localhost:3000";
}
