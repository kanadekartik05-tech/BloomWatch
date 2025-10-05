
'use server';

/**
 * @fileOverview Analyzes vegetation data to determine peak blooming seasons and suggest suitable flowers.
 * 
 * - getBloomAnalysis - A function that generates the analysis.
 * - BloomAnalysisInputSchema - The input type for the function.
 * - BloomAnalysisOutputSchema - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PredictNextBloomDateOutputSchema, NdviDataSchema } from './types';

export const BloomAnalysisInputSchema = z.object({
    locationName: z.string().describe('The name of the city or state being analyzed.'),
    vegetationData: NdviDataSchema.describe('The vegetation data (insolation proxy) for the location.'),
});
export type BloomAnalysisInput = z.infer<typeof BloomAnalysisInputSchema>;

export async function getBloomAnalysis(input: BloomAnalysisInput): Promise<z.infer<typeof PredictNextBloomDateOutputSchema>> {
    return getBloomAnalysisFlow(input);
}

const getBloomAnalysisPrompt = ai.definePrompt({
    name: 'getBloomAnalysisPrompt',
    input: { schema: BloomAnalysisInputSchema },
    output: { schema: PredictNextBloomDateOutputSchema },
    prompt: `You are an expert botanist and data analyst. Your job is to analyze vegetation data for a specific location to determine its peak blooming season and suggest suitable flower species.

Location: {{locationName}}

Analyze the provided vegetation data below, which uses 'All Sky Insolation' as a proxy for vegetation health.
- Identify the month(s) with the highest insolation values, which corresponds to the peak growing and likely blooming season.
- Based on the location and the peak season, suggest a few flower species that would thrive there.
- Provide a brief justification for your suggestions, explaining how the peak season supports their growth.
- Describe the ecological significance of this type of bloom in the region (e.g., impact on pollinators).
- Explain the potential impact on human activities (e.g., agriculture, tourism).
- Return the original vegetation data.

Vegetation Data (Insolation as a proxy for health):
{{#each vegetationData}}
- {{month}}: {{value}}
{{/each}}
`,
});

const getBloomAnalysisFlow = ai.defineFlow(
    {
        name: 'getBloomAnalysisFlow',
        inputSchema: BloomAnalysisInputSchema,
        outputSchema: PredictNextBloomDateOutputSchema,
    },
    async (input) => {
        const { output } = await getBloomAnalysisPrompt(input);
         // Ensure ndviData is passed through.
        if (output && !output.ndviData) {
            output.ndviData = input.vegetationData;
        }
        return output!;
    }
);
