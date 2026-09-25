import { z } from "zod";
import { getModel } from "../tools/llm.js";

export const DecisionSchema = z.object({
  verdict: z.enum(["INVEST", "PASS", "WATCH"]),
  confidence: z.number().min(0).max(100),
  summary: z.string().describe("One or two sentence bottom-line takeaway"),
  keyFactors: z.array(z.string()).describe("3-5 factors that most influenced the decision"),
  risks: z.array(z.string()).describe("2-4 concrete risks or red flags"),
  reasoning: z.string().describe("A short paragraph walking through the reasoning chain"),
});

export async function decide(state) {
  const model = getModel({ temperature: 0 }).withStructuredOutput(DecisionSchema, { name: "decision", method: "functionCalling" });

  const prompt = `You are a disciplined investment analyst deciding whether to INVEST, PASS, or WATCH a company, based only on the research brief below. Be decisive but honest about uncertainty — use WATCH when signal is genuinely mixed, not as a default hedge. Ground every factor and risk in something from the brief.\n\nCOMPANY: ${state.companyName}\n\nRESEARCH BRIEF:\n${state.analysis}`;

  const decision = await model.invoke(prompt);
  return {
    decision,
    steps: [`Reached verdict: ${decision.verdict} (confidence ${decision.confidence}%).`],
  };
}
