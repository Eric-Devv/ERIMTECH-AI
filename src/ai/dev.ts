import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-video.ts';
import '@/ai/flows/generate-code-explanation.ts';
import '@/ai/flows/generate-ai-chat-response.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/analyze-image.ts';