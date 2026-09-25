import { z } from "zod";
import { getModel } from "../tools/llm.js";

export const CritiqueSchema = z.object({
  consistent: z
    .boolean()
    .describe("True if the verdict logically follows from the brief and the stated factors/risks"),
  issues: z
    .array(z.string())
    .describe("Contradictions, unsupported claims, or gaps between the brief and the verdict. Empty array if none found."),
  adjustedConfidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Final confidence to report. Equal to the original if no issues were found; lowered if issues were found."),
  note: z
    .string()
    .describe("One sentence on what, if anything, changed after this check — shown to the end user."),
});

/**
 * Self-check node. Deliberately a separate LLM call from `decide`, with a
 * different job: audit, not decide. Re-reads the brief and the verdict and
 * looks for contradictions, unsupported factors/risks, or overconfidence —
 * then reports a (possibly lowered) final confidence. This exists so the
 * agent doesn't just rubber-stamp its first pass as final.
 */
export async function critique(state) {
  const model = getModel({ temperature: 0 }).withStructuredOutput(CritiqueSchema, { name: "critique", method: "functionCalling" });

  const prompt = `You are a skeptical second-reviewer checking another analyst's work before it goes out. Re-read the research brief and the verdict below. Check: does every key factor and risk actually appear in the brief? Does the confidence level match how solid the evidence actually is? Is the verdict logically supported, or is it a stretch?\n\nCOMPANY: ${state.companyName}\n\nRESEARCH BRIEF:\n${state.analysis}\n\nVERDICT TO REVIEW:\n${JSON.stringify(state.decision, null, 2)}`;

  const result = await model.invoke(prompt);

  return {
    decision: {
      ...state.decision,
      confidence: result.adjustedConfidence,
      critique: {
        consistent: result.consistent,
        issues: result.issues,
        note: result.note,
      },
    },
    steps: [
      result.consistent
        ? `Self-check passed: verdict is consistent with the brief. ${result.note}`
        : `Self-check flagged issues — confidence adjusted to ${result.adjustedConfidence}%. ${result.note}`,
    ],
  };
}
