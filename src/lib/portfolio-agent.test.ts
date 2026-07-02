import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { MAX_AGENT_OUTPUT_TOKENS } from "@/lib/chat-limits";

import {
  createPortfolioAgent,
  runPortfolioAgent,
  runPortfolioAgentStream,
  type PortfolioAgentRunner,
  type PortfolioAgentStreamRunner,
} from "./portfolio-agent";

describe("portfolio agent", () => {
  it("configures a focused OpenAI Agents SDK agent", () => {
    const agent = createPortfolioAgent();

    assert.equal(agent.name, "Miles Chu portfolio assistant");
    assert.equal(agent.model, "gpt-5.5");
    assert.equal(agent.modelSettings.maxTokens, MAX_AGENT_OUTPUT_TOKENS);
    assert.deepEqual(agent.modelSettings.reasoning, { effort: "none" });
    assert.deepEqual(agent.modelSettings.text, { verbosity: "low" });
    assert.ok(agent.instructions.toString().includes("public portfolio"));
    assert.equal(agent.tools.length, 1);
    assert.equal(agent.tools[0]?.name, "portfolio_snapshot");
  });

  it("runs through an injectable runner and trims output", async () => {
    const calls: string[] = [];
    const runner: PortfolioAgentRunner = async (_agent, input) => {
      calls.push(input);
      return {
        finalOutput: "  Miles works across GTM strategy, RevOps, and AI workflow systems.  ",
      };
    };

    const answer = await runPortfolioAgent("  What does Miles do?  ", runner);

    assert.deepEqual(calls, ["What does Miles do?"]);
    assert.equal(
      answer,
      "Miles works across GTM strategy, RevOps, and AI workflow systems.",
    );
  });

  it("rejects empty questions before calling the SDK", async () => {
    const runner: PortfolioAgentRunner = async () => {
      throw new Error("runner should not be called");
    };

    await assert.rejects(
      () => runPortfolioAgent("   ", runner),
      /Question is required/,
    );
  });

  it("streams through an injectable runner and trims input", async () => {
    const calls: string[] = [];
    const runner: PortfolioAgentStreamRunner = async (_agent, input) => {
      calls.push(input);

      return streamChunks(["Miles builds ", "AI workflow systems."]);
    };

    const stream = await runPortfolioAgentStream(
      "  What does Miles build?  ",
      runner,
    );

    assert.deepEqual(calls, ["What does Miles build?"]);
    assert.equal(
      await readTextStream(stream),
      "Miles builds AI workflow systems.",
    );
  });

  it("rejects empty streaming questions before calling the SDK", async () => {
    const runner: PortfolioAgentStreamRunner = async () => {
      throw new Error("runner should not be called");
    };

    await assert.rejects(
      () => runPortfolioAgentStream("   ", runner),
      /Question is required/,
    );
  });

  it("rejects empty SDK responses", async () => {
    const runner: PortfolioAgentRunner = async () => ({ finalOutput: "" });

    await assert.rejects(
      () => runPortfolioAgent("What are the impact metrics?", runner),
      /empty response/,
    );
  });
});

async function* streamChunks(chunks: string[]) {
  for (const chunk of chunks) {
    yield chunk;
  }
}

async function readTextStream(stream: AsyncIterable<string>) {
  let text = "";

  for await (const chunk of stream) {
    text += chunk;
  }

  return text;
}
