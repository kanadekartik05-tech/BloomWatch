'use server';

/**
 * @fileOverview Summarizes climate and vegetation chart data into a simple, human-readable text.
 * 
 * - summarizeChartData - A function that generates the summary.
 * - ChartDataSummaryInput - The input type for the function.
 * - ChartDataSummaryOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ChartDataSummaryInputSchema, ChartDataSummaryOutputSchema, type ChartDataSummaryInput, type ChartDataSummaryOutput } from './types';


export async function summarizeChartData(input: ChartDataSummaryInput): Promise<ChartDataSummaryOutput> {
    return summarizeChartDataFlow(input);
}

const summarizeChartDataPrompt = ai.definePrompt({
    name: 'summarizeChartDataPrompt',
    input: { schema: ChartDataSummaryInputSchema },
    output: { schema: ChartDataSummaryOutputSchema },
    prompt: `You are a helpful data analyst. Your job is to look at climate and vegetation data and explain it in a very simple, concise, and easy-to-understand way for a non-technical user.

Location: {{locationName}}

Analyze the provided climate (temperature and rainfall) and vegetation (insolation proxy) data below. Identify the key trends, peaks, and relationships. Then, generate a short summary (2-3 sentences) that explains what the charts are showing.

Focus on simple language. For example, instead of "NDVI values peaked in August", say "The plants were greenest and healthiest in August".

Climate Data:
{{#each climateData}}
- {{month}}: Temp: {{temperature}}°C, Rainfall: {{rainfall}}mm
{{/each}}

Vegetation Data (Insolation as a proxy for health):
{{#each vegetationData}}
- {{month}}: {{value}}
{{/each}}
`,
});

const summarizeChartDataFlow = ai.defineFlow(
    {
        name: 'summarizeChartDataFlow',
        inputSchema: ChartDataSummaryInputSchema,
        outputSchema: ChartDataSummaryOutputSchema,
    },
    async (input) => {
        const { output } = await summarizeChartDataPrompt(input);
        return output!;
    }
);
