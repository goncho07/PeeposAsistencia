// ==== [IMPORTS] ====
import wav from 'wav';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * @fileOverview An AI chat assistant for school administrators.
 *
 * - chatWithAssistant - A function that handles the chat interaction with the AI assistant.
 * - ChatWithAssistantInput - The input type for the chatWithAssistant function.
 * - ChatWithAssistantOutput - The return type for the chatWithAssistant function.
 */

'use server';

const ChatWithAssistantInputSchema = z.object({
  message: z.string().describe('The user message to the AI assistant.'),
});
export type ChatWithAssistantInput = z.infer<typeof ChatWithAssistantInputSchema>;

const ChatWithAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the user message.'),
  media: z.string().optional().describe('The media content for the AI assistant response.'),
});
export type ChatWithAssistantOutput = z.infer<typeof ChatWithAssistantOutputSchema>;

export async function chatWithAssistant(input: ChatWithAssistantInput): Promise<ChatWithAssistantOutput> {
  return chatWithAssistantFlow(input);
}

const chatWithAssistantPrompt = ai.definePrompt({
  name: 'chatWithAssistantPrompt',
  input: {schema: ChatWithAssistantInputSchema},
  output: {schema: ChatWithAssistantOutputSchema},
  prompt: `You are an AI chat assistant for school administrators in Peepos Pro.
        Your role is to answer questions and perform administrative tasks.
        Be brief and professional in your responses.
        User message: {{{message}}}`,
});


const chatWithAssistantFlow = ai.defineFlow(
  {
    name: 'chatWithAssistantFlow',
    inputSchema: ChatWithAssistantInputSchema,
    outputSchema: ChatWithAssistantOutputSchema,
  },
  async input => {
    const {output} = await chatWithAssistantPrompt(input);
    return output!;
  }
);
