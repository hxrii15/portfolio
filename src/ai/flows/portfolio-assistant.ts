// src/ai/flows/portfolio-assistant.ts
'use server';

/**
 * @fileOverview An AI-powered chatbot assistant for the portfolio.
 *
 * - portfolioAssistant - A function that processes user queries and provides relevant information from the portfolio.
 * - PortfolioAssistantInput - The input type for the portfolioAssistant function.
 * - PortfolioAssistantOutput - The return type for the portfolioAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PortfolioAssistantInputSchema = z.object({
  query: z.string().describe('The user query about the portfolio.'),
});
export type PortfolioAssistantInput = z.infer<typeof PortfolioAssistantInputSchema>;

const PortfolioAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the user query.'),
});
export type PortfolioAssistantOutput = z.infer<typeof PortfolioAssistantOutputSchema>;

export async function portfolioAssistant(input: PortfolioAssistantInput): Promise<PortfolioAssistantOutput> {
  return portfolioAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'portfolioAssistantPrompt',
  input: {schema: PortfolioAssistantInputSchema},
  output: {schema: PortfolioAssistantOutputSchema},
  prompt: `You are an AI assistant designed to help visitors navigate Hariharan's portfolio.
  Your goal is to understand the user's query and provide relevant information or direct them to the appropriate section of the portfolio.

  {% raw %}{{query}}{% endraw %}
  `,
});

const portfolioAssistantFlow = ai.defineFlow(
  {
    name: 'portfolioAssistantFlow',
    inputSchema: PortfolioAssistantInputSchema,
    outputSchema: PortfolioAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
