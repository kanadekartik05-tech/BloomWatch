'use server';

/**
 * @fileOverview Predicts the next bloom date for a given region based on historical NDVI data and geolocation.
 *
 * - predictNextBloomDate - A function that predicts the next bloom date.
 * - PredictNextBloomDateInput - The input type for the predictNextBloomDate function.
 * - PredictNextBloomDateOutput - The return type for the predictNextBloomDate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
});
export type PredictNextBloomDateInput = z.infer<typeof PredictNextBloomDateInputSchema>;

const PredictNextBloomDateOutputSchema = z.object({
  predictedNextBloomDate: z.string().describe('The predicted date of the next bloom event.'),
  explanation: z.string().describe('Explanation of how the bloom date was determined'),
});
export type PredictNextBloomDateOutput = z.infer<typeof PredictNextBloomDateOutputSchema>;

export async function predictNextBloomDate(input: PredictNextBloomDateInput): Promise<PredictNextBloomDateOutput> {
  return predictNextBloomDateFlow(input);
}

const predictNextBloomDatePrompt = ai.definePrompt({
  name: 'predictNextBloomDatePrompt',
  input: {schema: PredictNextBloomDateInputSchema},
  output: {schema: PredictNextBloomDateOutputSchema},
  prompt: `You are an expert in phenology and botany. You are skilled at predicting plant blooming events based on historical data and geographic location.

Given the historical NDVI (Normalized Difference Vegetation Index) data, the latest bloom date, and the geographic coordinates for a specific region, predict the date of the next bloom event.

Region Name: {{regionName}}
Coordinates: (Lat: {{lat}}, Lon: {{lon}})
Latest Bloom Date: {{latestBloomDate}}

Historical NDVI Data:
{{#each ndviData}}
  {{month}}: {{value}}
{{/each}}

Consider the patterns in the historical NDVI data and the geographic location. Blooming events typically occur when NDVI values reach a peak following a period of increasing values. The latitude and longitude can help you infer the hemisphere and general climate zone, which influences the timing of seasons.

Predict the month in which the next blooming event is most likely to occur based on historical patterns and location. Provide the date and a short explanation of your reasoning.

Output the predicted next bloom date as YYYY-MM-DD.
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
