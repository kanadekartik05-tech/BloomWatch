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
