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
  prompt: `You are an expert in phenology, botany, and climate science. You are skilled at predicting plant blooming events based on historical data, climate patterns, and geographic location.

Given the historical NDVI (Normalized Difference Vegetation Index) data, the latest bloom date, recent climate data, and the geographic coordinates for a specific region, predict the date of the next bloom event.

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

Consider the patterns in the historical NDVI data, the recent climate trends, and the geographic location. Blooming events typically occur when NDVI values reach a peak. This peak is influenced by preceding climate conditions like temperature and rainfall. The latitude and longitude can help you infer the hemisphere and general climate zone.

Analyze all the provided data to make a comprehensive prediction. Predict the month in which the next blooming event is most likely to occur. Provide the date and a short explanation of your reasoning, mentioning how the climate data influenced your prediction.

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
