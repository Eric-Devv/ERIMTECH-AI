// src/ai/flows/analyze-image.ts
'use server';

/**
 * @fileOverview Image analysis AI agent.
 *
 * - analyzeImage - A function that handles the image analysis process.
 * - AnalyzeImageInput - The input type for the analyzeImage function.
 * - AnalyzeImageOutput - The return type for the analyzeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {analyzeImage as replicateAnalyzeImage} from '@/services/replicate';

const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  analysisResult: z.object({
    description: z.string().describe('A description of the image.'),
  }),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const analyzeImagePrompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: {schema: AnalyzeImageInputSchema},
  output: {schema: AnalyzeImageOutputSchema},
  prompt: `You are an expert image analyst. Analyze the image and provide a detailed description of its content.

Image: {{media url=photoDataUri}}`,
});

const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async input => {
    // Call Replicate API to analyze the image
    const replicateResult = await replicateAnalyzeImage(input.photoDataUri);

    // If Replicate provides a description, use it. Otherwise, use the LLM to create it.
    if (replicateResult?.description) {
      return {
        analysisResult: {
          description: replicateResult.description,
        },
      };
    } else {
      const {output} = await analyzeImagePrompt(input);
      return output!;
    }
  }
);
