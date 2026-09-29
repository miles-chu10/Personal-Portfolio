export type AgentFailureKind = "quota" | "rate_limited" | "unavailable";

type ErrorFields = {
  name?: unknown;
  status?: unknown;
  code?: unknown;
  type?: unknown;
  requestID?: unknown;
};

export function describeAgentError(error: unknown) {
  const fields: ErrorFields =
    typeof error === "object" && error !== null ? (error as ErrorFields) : {};

  return {
    name: typeof fields.name === "string" ? fields.name : "Error",
    status: typeof fields.status === "number" ? fields.status : undefined,
    code: typeof fields.code === "string" ? fields.code : undefined,
    type: typeof fields.type === "string" ? fields.type : undefined,
    requestId:
      typeof fields.requestID === "string" ? fields.requestID : undefined,
  };
}

export function classifyAgentError(error: unknown): AgentFailureKind {
  const { code, status, type } = describeAgentError(error);

  if (
    code === "credit_balance_exhausted" ||
    code === "insufficient_quota" ||
    type === "insufficient_quota"
  ) {
    return "quota";
  }

  if (status === 429 || code === "rate_limit_exceeded") {
    return "rate_limited";
  }

  return "unavailable";
}

export function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export function agentFailureResponse(error: unknown) {
  if (!isAbortError(error)) {
    console.error("[api/agent] upstream failure", describeAgentError(error));
  }

  switch (classifyAgentError(error)) {
    case "quota":
      return Response.json(
        { error: "Portfolio agent is offline right now." },
        { status: 503 },
      );
    case "rate_limited":
      return Response.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 },
      );
    default:
      return Response.json(
        { error: "Portfolio agent failed." },
        { status: 500 },
      );
  }
}
