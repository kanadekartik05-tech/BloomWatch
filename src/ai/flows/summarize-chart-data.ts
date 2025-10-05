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
    prompt: `You are a helpful data analyst. Your job is to look at vegetation data and explain it in a very simple, concise, and easy-to-understand way for a non-technical user.

Location: {{locationName}}

Analyze the provided vegetation data below, which uses 'All Sky Insolation' as a proxy for vegetation health.
- Identify the month(s) with the highest insolation value (peak vegetation).
- Identify the month(s) with the lowest insolation value.
- Describe the general trend over the year (e.g., "Vegetation activity starts low in winter, peaks in summer, and then declines in autumn.").
- Generate a short, narrative summary (2-3 sentences) that explains what this chart is showing about the yearly cycle of plant life in the area.

Use simple language. For example, instead of "Insolation values peaked in August", say "The plants appear to be most active and healthiest in August".

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
