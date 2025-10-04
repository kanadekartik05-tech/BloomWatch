
'use server';
/**
 * @fileOverview Fetches bloom predictions for multiple regions in parallel.
 * This flow is designed for efficiency to populate a global dashboard.
 */

import { ai } from '@/ai/genkit';
import { getNdviData } from './get-ndvi-data';
import { getClimateData } from './get-climate-data';
import { predictNextBloomDate } from './predict-next-bloom-date';
import type { Region } from '@/lib/data';
import { 
    type ClimateDataInput, 
    type SinglePredictionResult,
    BatchPredictionInputSchema,
    type BatchPredictionInput,
    BatchPredictionOutputSchema,
    type BatchPredictionOutput,
} from './types';


export async function getBatchPredictions(input: BatchPredictionInput): Promise<BatchPredictionOutput> {
    return getBatchPredictionsFlow(input);
}


// Helper function to process a single region.
// It fetches data and then gets a prediction.
async function processRegion(region: Pick<Region, 'name'|'lat'|'lon'|'latest_bloom'>): Promise<SinglePredictionResult> {
    try {
         const climateInput: ClimateDataInput = { lat: region.lat, lon: region.lon };

        // Fetch vegetation and climate data in parallel for this region
        const [ndviResult, climateResult] = await Promise.all([
            getNdviData(climateInput),
            getClimateData(climateInput)
        ]);
        
        if (!ndviResult || ndviResult.length === 0) {
             throw new Error("No vegetation data found.");
        }

        const predictionInput = {
            regionName: region.name,
            lat: region.lat,
            lon: region.lon,
            ndviData: ndviResult.map(d => ({ month: d.month, value: d.value })),
            latestBloomDate: region.latest_bloom,
            climateData: climateResult,
        };

        const result = await predictNextBloomDate(predictionInput);
        return { success: true, data: result };

    } catch (error: any) {
        console.error(`Failed to process region ${region.name}:`, error);
        return { success: false, error: error.message || "An unknown error occurred" };
    }
}


const getBatchPredictionsFlow = ai.defineFlow(
  {
    name: 'getBatchPredictionsFlow',
    inputSchema: BatchPredictionInputSchema,
    outputSchema: BatchPredictionOutputSchema,
  },
  async ({ regions }) => {

    // Use Promise.all to run all region processing in parallel
    const allPredictions = await Promise.all(
      regions.map(region => processRegion(region))
    );

    return allPredictions;
  }
);
