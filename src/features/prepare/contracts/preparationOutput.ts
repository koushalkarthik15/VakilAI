import { z } from 'zod';

export const PreparationOutputSchema = z.object({
  purpose: z.string(),
  generated_narrative: z.string(),
  relevant_finding_ids: z.array(z.string()),
  relevant_action_ids: z.array(z.string()),
  questions: z.array(z.string()),
  information_to_collect: z.array(z.string()),
  facts_to_verify: z.array(z.string()),
  source_references: z.array(z.string()),
  warnings: z.array(z.string())
});

export type PreparationOutput = z.infer<typeof PreparationOutputSchema>;
