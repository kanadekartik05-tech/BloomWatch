
'use server';

/**
 * @fileOverview Analyzes a region's climate and vegetation data to suggest suitable flower species.
 *
 * - predictNextBloomDate - A function that performs the analysis.
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
  prompt: `You are an expert in botany, agriculture, and climate science. You are skilled at recommending suitable flower species for a given region.

Given the historical vegetation data (insolation as a proxy), recent climate data, and the geographic coordinates for a specific region, perform the following tasks:
1.  Suggest potential flower species that are suitable for this region's climate.
2.  Provide a brief justification for your species suggestions, explaining why they are suitable based on the provided climate data (temperature, rainfall) and vegetation trends.
3.  Describe the ecological significance of this type of bloom in the region.
4.  Explain the potential impact on human activities (e.g., agriculture, economy, tourism).
5.  Return the original vegetation data in the 'ndviData' output field for display purposes.

Region Name: {{regionName}}
Coordinates: (Lat: {{lat}}, Lon: {{lon}})

Historical Insolation Data (Proxy for Vegetation Health):
{{#each ndviData}}
  {{month}}: {{value}}
{{/each}}

Recent Climate Data (Last 12 Months):
{{#each climateData}}
  {{month}}: Temp: {{temperature}}°C, Rainfall: {{rainfall}}mm
{{/each}}

Analysis Instructions:
-   **potentialSpecies**: Based on the region's geography ({{lat}}, {{lon}}) and the climate data, list a few flower species suitable for growing in this region.
-   **predictionJustification**: Explain in detail why the suggested species are suitable. Reference the temperature and rainfall data. For example, "Species X thrives in warm climates with moderate rainfall, which aligns with this region's average temperature of Y°C and annual precipitation of Z mm."
-   **ecologicalSignificance**: Describe why cultivating these species is important for the local ecosystem. Consider pollinators (bees, butterflies), soil health, and biodiversity.
-   **humanImpact**: Describe the relevance of these flowers for people. Think about agriculture (e.g., ornamental flowers), tourism (e.g., flower festivals), or local economy.
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
    
