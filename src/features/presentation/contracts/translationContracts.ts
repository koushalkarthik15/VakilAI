import { z } from 'zod';

export const TranslatedFindingSchema = z.object({
  finding_id: z.string().min(1),
  summary: z.string(),
  explanation: z.string(),
  missing_information: z.array(z.string())
});

export const TranslatedComparisonItemSchema = z.object({
  comparison_id: z.string().min(1),
  contract_position_statement: z.string(),
  legal_baseline_summary: z.string(),
  explanation: z.string()
});

export const TranslatedActionItemSchema = z.object({
  action_id: z.string().min(1),
  title: z.string(),
  description: z.string(),
  required_information: z.array(z.string())
});

export const TranslatedPresentationDTOSchema = z.object({
  language: z.enum(['TE', 'HI']),
  findings: z.array(TranslatedFindingSchema).optional(),
  comparison_items: z.array(TranslatedComparisonItemSchema).optional(),
  unresolved_questions: z.array(z.string()).optional(),
  action_items: z.array(TranslatedActionItemSchema).optional(),
  questions: z.array(z.string()).optional(),
  information_to_collect: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  prepare_purpose: z.string().optional(),
  prepare_generated_narrative: z.string().optional(),
  prepare_facts_to_verify: z.array(z.string()).optional()
});

export type TranslatedPresentationDTO = z.infer<typeof TranslatedPresentationDTOSchema>;
