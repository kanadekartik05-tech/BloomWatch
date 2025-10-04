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
import { ClimateDataOutputSchema } from './types';
import type { NdviDataOutput } from './get-ndvi-data';

const NdviDataSchema = z.array(z.object({
    month: z.string(),
    value: z.number(),
    date: z.string(),
}));

export const ChartDataSummaryInputSchema = z.object({
    locationName: z.string().describe('The name of the city or state being analyzed.'),
    climateData: ClimateDataOutputSchema.describe('The climate data (temperature and rainfall) for the location.'),
    vegetationData: NdviDataSchema.describe('The vegetation data (insolation proxy) for the location.'),
});
export type ChartDataSummaryInput = z.infer<typeof ChartDataSummaryInputSchema>;

export const ChartDataSummaryOutputSchema = z.object({
    summary: z.string().describe('A short, easy-to-understand summary of the key trends in the climate and vegetation data.'),
});
export type ChartDataSummaryOutput = z.infer<typeof ChartDataSummaryOutputSchema>;

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
