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
    description: 'Fetches the plain text content from a given URL. Use this tool if a URL is provided and you need to access its content to answer the user prompt.',
    inputSchema: z.object({
      url: z.string().describe('The URL to fetch content from.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    try {
      const response = await fetch(input.url);
      if (!response.ok) {
        // Try to get more specific error message from the response if possible
        let errorBody = '';
        try {
          errorBody = await response.text();
        } catch (e) {}
        console.error(`Failed to fetch content from URL: ${input.url}. Status: ${response.status}. Body: ${errorBody}`);
        return `Error fetching content from ${input.url}: HTTP status ${response.status}. ${errorBody ? 'Details: ' + errorBody.substring(0,100) : ''}`;
      }
      const textContent = await response.text();
      // Basic HTML stripping, might need a more robust solution for complex pages
      const plainText = textContent.replace(/<[^>]+>/g, ' ').replace(/\s\s+/g, ' ').trim();
      return plainText.substring(0, 5000); // Limit content length
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
A URL has been provided by the user: {{{url}}}.
If understanding the content of this URL is necessary to answer the user's prompt, use the 'getContentFromUrl' tool to fetch its content. Then, incorporate the fetched content into your response as needed. Do not call the tool if the URL content is not directly relevant to the user's question.
{{/if}}

User prompt: {{{prompt}}}`,
});

const generateAiChatResponseFlow = ai.defineFlow(
  {
    name: 'generateAiChatResponseFlow',
    inputSchema: GenerateAiChatResponseInputSchema,
    outputSchema: GenerateAiChatResponseOutputSchema,
  },
  async input => {
    const {output} = await generateAiChatResponsePrompt(input);
    if (!output) {
      throw new Error('AI chat response generation failed to produce an output.');
    }
    return output;
  }
);
