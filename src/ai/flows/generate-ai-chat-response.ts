// src/ai/flows/generate-ai-chat-response.ts
'use server';

/**
 * @fileOverview Generates AI chat responses, optionally incorporating content from URLs.
 *
 * - generateAiChatResponse - A function that generates AI chat responses.
 * - GenerateAiChatResponseInput - The input type for the generateAiChatResponse function.
 * - GenerateAiChatResponseOutput - The return type for the generateAiChatResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiChatResponseInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate a response for.'),
  url: z.string().optional().describe('Optional URL to fetch content from and include in the prompt.'),
});
export type GenerateAiChatResponseInput = z.infer<typeof GenerateAiChatResponseInputSchema>;

const GenerateAiChatResponseOutputSchema = z.object({
  response: z.string().describe('The AI generated response.'),
});
export type GenerateAiChatResponseOutput = z.infer<typeof GenerateAiChatResponseOutputSchema>;

export async function generateAiChatResponse(input: GenerateAiChatResponseInput): Promise<GenerateAiChatResponseOutput> {
  return generateAiChatResponseFlow(input);
}

const getContentFromUrl = ai.defineTool(
  {
    name: 'getContentFromUrl',
    description: 'Fetches the content from a given URL.',
    inputSchema: z.object({
      url: z.string().describe('The URL to fetch content from.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      const response = await fetch(input.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch content from URL: ${input.url}`);
      }
      return await response.text();
    } catch (error: any) {
      console.error(`Error fetching content from URL: ${input.url}`, error);
      return `Error fetching content from ${input.url}: ${error.message}`;
    }
  }
);

const generateAiChatResponsePrompt = ai.definePrompt({
  name: 'generateAiChatResponsePrompt',
  tools: [getContentFromUrl],
  input: {schema: GenerateAiChatResponseInputSchema},
  output: {schema: GenerateAiChatResponseOutputSchema},
  prompt: `You are a helpful AI assistant. Respond to the user's prompt.

  {{#if url}}
  The user has provided a URL. Use the getContentFromUrl tool to get the content from the URL and include it in your response.
  URL: {{{url}}}
  Content: {{ await getContentFromUrl url=url }}
  {{/if}}

  Prompt: {{{prompt}}}`,
});

const generateAiChatResponseFlow = ai.defineFlow(
  {
    name: 'generateAiChatResponseFlow',
    inputSchema: GenerateAiChatResponseInputSchema,
    outputSchema: GenerateAiChatResponseOutputSchema,
  },
  async input => {
    const {output} = await generateAiChatResponsePrompt(input);
    return output!;
  }
);
