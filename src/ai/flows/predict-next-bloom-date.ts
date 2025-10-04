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
import { ClimateDataOutputSchema } from './types';

const PredictNextBloomDateInputSchema = z.object({
  regionName: z.string().describe('The name of the region.'),
  lat: z.number().describe('The latitude of the region.'),
  lon: z.number().describe('The longitude of the region.'),
  ndviData: z.array(
    z.object({
      month: z.string().describe('The month of the NDVI reading.'),
      value: z.number().describe('The NDVI value for the month.'),
    })
  ).describe('Historical NDVI data for the region.'),
  latestBloomDate: z.string().describe('The most recent bloom date for the region.'),
  climateData: ClimateDataOutputSchema.describe('Recent climate data for the region for the last 12 months.'),
});
export type PredictNextBloomDateInput = z.infer<typeof PredictNextBloomDateInputSchema>;

const PredictNextBloomDateOutputSchema = z.object({
  predictedNextBloomDate: z.string().describe('The predicted date of the next bloom event (YYYY-MM-DD).'),
  predictionJustification: z.string().describe('A brief justification for the prediction date based on the provided data.'),
  ecologicalSignificance: z.string().describe("The ecological significance of this blooming event for the region's ecosystem, including its impact on pollinators and wildlife."),
  potentialSpecies: z.string().describe('A list of potential plant or tree species that might be blooming in this region at this time of year, based on the geographic location.'),
  humanImpact: z.string().describe('The potential impact of this bloom event on human activities, such as agriculture (e.g., crop flowering), tourism, or public health (e.g., pollen allergies).'),
});
export type PredictNextBloomDateOutput = z.infer<typeof PredictNextBloomDateOutputSchema>;

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
    return output!;
  }
);
