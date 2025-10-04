
'use server';

/**
 * @fileOverview Predicts the next bloom date for a given region based on historical NDVI and climate data.
 *
 * - predictNextBloomDate - A function that predicts the next bloom date.
 * - PredictNextBloomDateInput - The input type for the predictNextBloomDate function.
 * - PredictNextBloomDateOutput - The return type for the predictNextBloomDate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PredictNextBloomDateInputSchema, PredictNextBloomDateOutputSchema, type PredictNextBloomDateInput, type PredictNextBloomDateOutput } from './types';


export async function predictNextBloomDate(input: PredictNextBloomDateInput): Promise<PredictNextBloomDateOutput> {
  return predictNextBloomDateFlow(input);
}

const predictNextBloomDatePrompt = ai.definePrompt({
  name: 'predictNextBloomDatePrompt',
  input: {schema: PredictNextBloomDateInputSchema},
  output: {schema: PredictNextBloomDateOutputSchema},
  prompt: `You are an expert in phenology, botany, and climate science. You are skilled at predicting plant blooming events and explaining their broader ecological context.

Given the historical NDVI (Normalized Difference Vegetation Index) data, the latest bloom date, recent climate data, and the geographic coordinates for a specific region, perform the following tasks:
1.  Predict the date of the next bloom event.
2.  Provide a brief justification for your prediction.
3.  Describe the ecological significance of this bloom.
4.  Suggest potential plant species that might be blooming.
5.  Explain the potential impact on human activities.
6.  Return the original NDVI data in the 'ndviData' output field.

Region Name: {{regionName}}
Coordinates: (Lat: {{lat}}, Lon: {{lon}})
Latest Bloom Date: {{latestBloomDate}}

Historical NDVI Data (Vegetation Index):
{{#each ndviData}}
  {{month}}: {{value}}
{{/each}}

Recent Climate Data (Last 12 Months):
{{#each climateData}}
  {{month}}: Temp: {{temperature}}°C, Rainfall: {{rainfall}}mm
{{/each}}

Analysis Instructions:
-   **predictedNextBloomDate**: Analyze all provided data to predict the next bloom date. Blooming events typically occur when NDVI values reach a peak, influenced by preceding climate conditions. Output the date in YYYY-MM-DD format.
-   **predictionJustification**: Briefly explain your reasoning, mentioning how the climate and NDVI data influenced your prediction.
-   **ecologicalSignificance**: Describe why this bloom is important for the local ecosystem. Consider pollinators (bees, butterflies), birds, and other wildlife that depend on these flowers for food and habitat.
-   **potentialSpecies**: Based on the region's geography ({{lat}}, {{lon}}) and the time of year, list a few plant or tree species likely to be contributing to this bloom. For example, for Kyoto in April, you would mention Cherry Blossoms (Sakura).
-   **humanImpact**: Describe the relevance of this bloom for people. Think about agriculture (e.g., fruit tree flowering), tourism (e.g., wildflower festivals), or public health (e.g., high pollen counts).
-   **ndviData**: Return the 'ndviData' array that was provided as input.
`,
});

const predictNextBloomDateFlow = ai.defineFlow(
  {
    name: 'predictNextBloomDateFlow',
    inputSchema: PredictNextBloomDateInputSchema,
    outputSchema: PredictNextBloomDateOutputSchema,
  },
  async input => {
    const {output} = await predictNextBloomDatePrompt(input);
    // Ensure ndviData is passed through.
    if (output && !output.ndviData) {
        output.ndviData = input.ndviData;
    }
    return output!;
  }
);
