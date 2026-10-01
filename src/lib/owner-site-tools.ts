const SECTIONS = ["work", "impact", "skills"] as const;
const ENDPOINT = "/api/owner/site-tools";

export type SiteTool = {
  name: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean };
  execute: (input: unknown, options?: { signal: AbortSignal }) => Promise<unknown>;
};

export type SiteToolsDocument = Document & {
  modelContext?: {
    registerTool: (tool: SiteTool, options: { signal: AbortSignal }) => Promise<void>;
  };
};

// Prepared integration only: the server currently denies all access. A future
// owner session must authorize discovery AND every operation at ENDPOINT.
export async function registerOwnerSiteTools(
  doc: SiteToolsDocument,
  lifetime: AbortController,
  request: typeof fetch = fetch,
) {
  const context = doc.modelContext;
  if (typeof context?.registerTool !== "function" || lifetime.signal.aborted) return;

  async function authorize(operation?: string, section?: string, signal?: AbortSignal) {
    const response = await request(ENDPOINT, {
      method: operation ? "POST" : "GET",
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
      signal: signal ? AbortSignal.any([signal, lifetime.signal]) : lifetime.signal,
      ...(operation ? {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation, section }),
      } : {}),
    });
    return response.ok && (await response.json()).authorized === true;
  }

  try {
    if (!(await authorize()) || lifetime.signal.aborted) return;

    for (const operation of ["inspect", "navigate"] as const) {
      await context.registerTool({
        name: `portfolio_${operation}_section`,
        description: operation === "inspect"
          ? "Read the visible text in a portfolio section. Requires the signed-in owner."
          : "Scroll the portfolio to Work, Impact, or Skills. Requires the signed-in owner.",
        inputSchema: {
          type: "object",
          properties: { section: { type: "string", enum: [...SECTIONS] } },
          required: ["section"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: operation === "inspect" },
        execute: async (input, options) => {
          if (lifetime.signal.aborted || options?.signal.aborted) throw new Error("Site tool canceled.");
          if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid section.");
          const args = input as Record<string, unknown>;
          if (Object.keys(args).length !== 1 || !SECTIONS.some((section) => section === args.section)) {
            throw new Error("Invalid section.");
          }
          const section = args.section as string;
          try {
            if (!(await authorize(operation, section, options?.signal))) throw new Error("Access denied.");
          } catch {
            lifetime.abort();
            throw new Error("Owner authorization unavailable; site tools disabled.");
          }
          if (lifetime.signal.aborted || options?.signal.aborted) throw new Error("Site tool canceled.");
          const target = doc.getElementById(section);
          if (!target) throw new Error("Section unavailable.");
          if (operation === "navigate") {
            target.scrollIntoView({ behavior: "instant", block: "start" });
            return { section, scrolled: true };
          }
          return { section, text: target.innerText.slice(0, 12000) };
        },
      }, { signal: lifetime.signal });
      if (lifetime.signal.aborted) return;
    }
  } catch {
    // API revocation, network failure, or partial registration must not leave
    // active tools or break the ordinary portfolio.
    lifetime.abort();
  }
}
