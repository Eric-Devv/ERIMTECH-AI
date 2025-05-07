'use server';
/**
 * @fileOverview A code explanation AI agent.
 *
 * - generateCodeExplanation - A function that handles the code explanation process.
 * - GenerateCodeExplanationInput - The input type for the generateCodeExplanation function.
 * - GenerateCodeExplanationOutput - The return type for the generateCodeExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeExplanationInputSchema = z.object({
  code: z.string().describe('The code snippet to be explained.'),
  language: z.string().describe('The programming language of the code snippet.'),
});
export type GenerateCodeExplanationInput = z.infer<typeof GenerateCodeExplanationInputSchema>;

const GenerateCodeExplanationOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the code snippet.'),
});
export type GenerateCodeExplanationOutput = z.infer<typeof GenerateCodeExplanationOutputSchema>;

export async function generateCodeExplanation(
  input: GenerateCodeExplanationInput
): Promise<GenerateCodeExplanationOutput> {
  return generateCodeExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeExplanationPrompt',
  input: {schema: GenerateCodeExplanationInputSchema},
  output: {schema: GenerateCodeExplanationOutputSchema},
  prompt: `You are an expert software developer. You will explain the following code snippet to the user. The code is written in the following language: {{{language}}}.

Code:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`

Provide a clear and concise explanation of what the code does, how it works, and any important concepts or patterns it demonstrates.
Your response should be a JSON object matching the output schema, specifically like: {"explanation": "Your detailed explanation here."}`,
});

const generateCodeExplanationFlow = ai.defineFlow(
  {
    name: 'generateCodeExplanationFlow',
    inputSchema: GenerateCodeExplanationInputSchema,
    outputSchema: GenerateCodeExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error('Code explanation failed to produce an output.');
    }
    return output;
  }
);
