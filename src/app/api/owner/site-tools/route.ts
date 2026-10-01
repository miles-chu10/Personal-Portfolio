// The portfolio has anonymous chat visitors, but no verified owner identity.
// Keep BOTH discovery and execution disabled until an owner sign-in flow is
// approved and implemented. Never authorize from an email/header/query flag,
// the ChatKit visitor cookie, browser capability, or a public environment flag.
function denyOwnerTools() {
  return Response.json(
    { authorized: false, error: "Owner sign-in is not configured." },
    { status: 403, headers: { "Cache-Control": "private, no-store" } },
  );
}

export const GET = denyOwnerTools;
export const POST = denyOwnerTools;
