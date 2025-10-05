
import { z } from 'genkit';

export const ClimateDataInputSchema = z.object({
    lat: z.number().describe('Latitude of the location.'),
    lon: z.number().describe('Longitude of the location.'),
    startDate: z.string().optional().describe('The start date for the data fetch (YYYY-MM-DD).'),
    endDate: z.string().optional().describe('The end date for the data fetch (YYYY-MM-DD).'),
});
export type ClimateDataInput = z.infer<typeof ClimateDataInputSchema>;

export const ClimateDataOutputSchema = z.array(z.object({
    month: z.string().describe('The month of the data point.'),
    temperature: z.number().describe('Average monthly temperature in Celsius.'),
    rainfall: z.number().describe('Total monthly precipitation in mm.'),
}));
export type ClimateDataOutput = z.infer<typeof ClimateDataOutputSchema>;

export const NdviDataSchema = z.array(z.object({
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


const NdviPredictionDataSchema = z.array(
    z.object({
      month: z.string().describe('The month of the NDVI reading.'),
      value: z.number().describe('The NDVI value for the month.'),
      date: z.string().describe('The specific date for the reading.'),
    })
);

export const PredictNextBloomDateInputSchema = z.object({
  regionName: z.string().describe('The name of the region.'),
  lat: z.number().describe('The latitude of the region.'),
  lon: z.number().describe('The longitude of the region.'),
  ndviData: NdviPredictionDataSchema.describe('Historical vegetation proxy data (insolation) for the region.'),
  latestBloomDate: z.string().describe('The most recent bloom date for the region.'),
  climateData: ClimateDataOutputSchema.describe('Recent climate data for the region for the last 12 months.'),
});
export type PredictNextBloomDateInput = z.infer<typeof PredictNextBloomDateInputSchema>;

export const PredictNextBloomDateOutputSchema = z.object({
  predictionJustification: z.string().describe('A brief justification for the species suggestion based on the provided data.'),
  ecologicalSignificance: z.string().describe("The ecological significance of this blooming event for the region's ecosystem, including its impact on pollinators and wildlife."),
  potentialSpecies: z.string().describe('A list of potential plant or tree species that might be blooming in this region at this time of year, based on the geographic location.'),
  humanImpact: z.string().describe('The potential impact of this bloom event on human activities, such as agriculture (e.g., crop flowering), tourism, or public health (e.g., pollen allergies).'),
  ndviData: NdviPredictionDataSchema.describe('The same vegetation proxy data that was passed as input, returned for charting purposes.'),
});
export type PredictNextBloomDateOutput = z.infer<typeof PredictNextBloomDateOutputSchema>;


const RegionSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
  latest_bloom: z.string(),
});
export type RegionSchemaType = z.infer<typeof RegionSchema>;

export const BatchPredictionInputSchema = z.object({
  regions: z.array(RegionSchema),
});
export type BatchPredictionInput = z.infer<typeof BatchPredictionInputSchema>;

const SinglePredictionSuccessSchema = z.object({
    success: z.literal(true),
    data: PredictNextBloomDateOutputSchema,
});
const SinglePredictionFailureSchema = z.object({
    success: z.literal(false),
    error: z.string(),
});
export const SinglePredictionResultSchema = z.union([
    SinglePredictionSuccessSchema,
    SinglePredictionFailureSchema,
]);
export type SinglePredictionResult = z.infer<typeof SinglePredictionResultSchema>;


export const BatchPredictionOutputSchema = z.array(SinglePredictionResultSchema);
export type BatchPredictionOutput = z.infer<typeof BatchPredictionOutputSchema>;
