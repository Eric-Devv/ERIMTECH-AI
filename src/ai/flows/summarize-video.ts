'use server';

/**
 * @fileOverview Summarizes the content of a video given a URL.
 *
 * - summarizeVideo - A function that summarizes a video.
 * - SummarizeVideoInput - The input type for the summarizeVideo function.
 * - SummarizeVideoOutput - The return type for the summarizeVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeVideoInputSchema = z.object({
  videoUrl: z.string().describe('The URL of the video to summarize.'),
});
export type SummarizeVideoInput = z.infer<typeof SummarizeVideoInputSchema>;

const SummarizeVideoOutputSchema = z.object({
  summary: z.string().describe('A summary of the video content.'),
});
export type SummarizeVideoOutput = z.infer<typeof SummarizeVideoOutputSchema>;

export async function summarizeVideo(input: SummarizeVideoInput): Promise<SummarizeVideoOutput> {
  return summarizeVideoFlow(input);
}

const summarizeVideoPrompt = ai.definePrompt({
  name: 'summarizeVideoPrompt',
  input: {schema: SummarizeVideoInputSchema},
  output: {schema: SummarizeVideoOutputSchema},
  prompt: `You are an expert video summarizer. Given the URL of a video,
your job is to summarize the content of the video. If the video content cannot be accessed or processed, provide a message indicating that.

Video URL: {{{videoUrl}}}

Your response should be a JSON object matching the output schema, specifically like: {"summary": "Your video summary here."}`,
});

const summarizeVideoFlow = ai.defineFlow(
  {
    name: 'summarizeVideoFlow',
    inputSchema: SummarizeVideoInputSchema,
    outputSchema: SummarizeVideoOutputSchema,
  },
  async input => {
    const {output} = await summarizeVideoPrompt(input);
    if (!output) {
        throw new Error('Video summarization failed to produce an output.');
    }
    return output;
  }
);
