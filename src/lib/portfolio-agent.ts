import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

import {
  earlier,
  footerLinks,
  impactRows,
  latest,
  miscLinks,
  profile,
  skillRows,
} from "@/data/portfolio";

const sectionSchema = z
  .enum(["profile", "timeline", "impact", "skills", "links", "all"])
  .optional()
  .default("all");

const portfolioSnapshot = tool({
  name: "portfolio_snapshot",
  description:
    "Return public portfolio facts for Miles Chu. Use this before answering questions about his work, impact, skills, or links.",
  parameters: z.object({
    section: sectionSchema,
  }),
  async execute({ section }) {
    return JSON.stringify(getPortfolioSnapshot(section));
  },
});

export function createPortfolioAgent() {
  return new Agent({
    name: "Miles Chu portfolio assistant",
    instructions:
      "Answer questions about Miles Chu's public portfolio. Use portfolio_snapshot for factual grounding. Keep answers concise, specific, plain text, and limited to the public portfolio data.",
    model: "gpt-5.5",
    tools: [portfolioSnapshot],
  });
}

export type PortfolioAgent = ReturnType<typeof createPortfolioAgent>;

export type PortfolioAgentRunner = (
  agent: PortfolioAgent,
  input: string,
) => Promise<{ finalOutput?: unknown }>;

export type PortfolioAgentStreamRunner = (
  agent: PortfolioAgent,
  input: string,
) => Promise<AsyncIterable<string>>;

export async function runPortfolioAgent(
  question: string,
  runner: PortfolioAgentRunner = runPortfolioAgentWithSdk,
) {
  const normalizedQuestion = normalizeQuestion(question);

  const result = await runner(createPortfolioAgent(), normalizedQuestion);
  const output = result.finalOutput;

  if (typeof output !== "string" || !output.trim()) {
    throw new Error("Portfolio agent returned an empty response.");
  }

  return output.trim();
}

export async function runPortfolioAgentStream(
  question: string,
  runner: PortfolioAgentStreamRunner = runPortfolioAgentStreamWithSdk,
) {
  const normalizedQuestion = normalizeQuestion(question);

  return runner(createPortfolioAgent(), normalizedQuestion);
}

function runPortfolioAgentWithSdk(agent: PortfolioAgent, input: string) {
  return run(agent, input, {
    maxTurns: 4,
  });
}

async function runPortfolioAgentStreamWithSdk(
  agent: PortfolioAgent,
  input: string,
) {
  const result = await run(agent, input, {
    maxTurns: 4,
    stream: true,
  });

  return result.toTextStream();
}

function normalizeQuestion(question: string) {
  const normalizedQuestion = question.trim();

  if (!normalizedQuestion) {
    throw new Error("Question is required.");
  }

  return normalizedQuestion;
}

function getPortfolioSnapshot(section: z.infer<typeof sectionSchema>) {
  const snapshot = {
    profile,
    timeline: {
      latest,
      earlier,
    },
    impact: impactRows,
    skills: skillRows,
    links: {
      misc: miscLinks,
      footer: footerLinks,
    },
  };

  if (section === "all") {
    return snapshot;
  }

  return {
    [section]: snapshot[section],
  };
}
