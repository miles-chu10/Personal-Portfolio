import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createPortfolioAgent,
  runPortfolioAgent,
  type PortfolioAgentRunner,
} from "./portfolio-agent";

describe("portfolio agent", () => {
  it("configures a focused OpenAI Agents SDK agent", () => {
    const agent = createPortfolioAgent();

    assert.equal(agent.name, "Miles Chu portfolio assistant");
    assert.equal(agent.model, "gpt-5.5");
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

  it("rejects empty SDK responses", async () => {
    const runner: PortfolioAgentRunner = async () => ({ finalOutput: "" });

    await assert.rejects(
      () => runPortfolioAgent("What are the impact metrics?", runner),
      /empty response/,
    );
  });
});
