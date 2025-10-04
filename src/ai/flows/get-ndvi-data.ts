'use server';

/**
 * @fileOverview Fetches NDVI (Normalized Difference Vegetation Index) data from the NASA POWER API.
 * 
 * - getNdviData - A function that fetches NDVI data for a given region.
 * - ClimateDataInput - The input type (reused for lat/lon).
 * - NdviDataOutput - The return type for the getNdviData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';
import { sub, format, getYear, getMonth, addMonths, startOfMonth } from 'date-fns';
import { ClimateDataInputSchema } from './types';

const NdviDataOutputSchema = z.array(z.object({
    month: z.string(),
    value: z.number(),
}));
export type NdviDataOutput = z.infer<typeof NdviDataOutputSchema>;

export async function getNdviData(input: z.infer<typeof ClimateDataInputSchema>): Promise<NdviDataOutput> {
    return getNdviDataFlow(input);
}

const getNdviDataFlow = ai.defineFlow(
    {
        name: 'getNdviDataFlow',
        inputSchema: ClimateDataInputSchema,
        outputSchema: NdviDataOutputSchema,
    },
    async ({ lat, lon }) => {
        const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;
        
        // Fetch data for the last 2 years to ensure we have a full 12-month cycle
        const endDate = new Date();
        const startDate = sub(endDate, { years: 2 });

        const startYear = format(startDate, 'yyyy');
        const endYear = format(endDate, 'yyyy');

        const parameters = 'NDVI'; 
        const community = 'RE'; // Renewable Energy
        const formatType = 'JSON';

        let apiUrl = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=${parameters}&community=${community}&longitude=${lon}&latitude=${lat}&start=${startYear}&end=${endYear}&format=${formatType}`;
        
        if (apiKey && apiKey !== "YOUR_NASA_API_KEY_HERE" && apiKey.length > 5) {
            apiUrl += `&api_key=${apiKey}`;
        }
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`NASA POWER API request failed for NDVI with status ${response.status}: ${errorText}`);
            }
            const data: any = await response.json();

            if (data.header && data.header.api_message) {
                 if (data.header.api_message.includes("No data was found for the requested time period")) {
                    return []; // Return empty array if no data is found, preventing a crash.
                 }
            }

            if (data.error || (data.messages && data.messages.length > 0)) {
                const errorMessage = data.error || (data.messages && data.messages.join(', '));
                throw new Error(`NASA POWER API Error for NDVI: ${errorMessage}`);
            }
            
            const ndvi = data.properties.parameter.NDVI;

            if (!ndvi) {
                throw new Error('NDVI data not found in NASA POWER API response.');
            }
            
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            const allData = Object.keys(ndvi).map((key) => {
                 if(key.endsWith('13')) return null; // ignore annual average
                
                const year = parseInt(key.slice(0, 4), 10);
                const monthIndex = parseInt(key.slice(4, 6), 10) - 1;

                // The API can return -999 for no data, which we'll treat as 0
                const value = ndvi[key] > -99 ? ndvi[key] : 0;

                return {
                    year,
                    month: monthNames[monthIndex],
                    monthIndex,
                    value: value,
                    date: new Date(year, monthIndex)
                };
            }).filter((item): item is Exclude<typeof item, null> => item !== null);
            
            // Get the last 12 full months of data from today
            const last12Months: {month: string, value: number}[] = [];
            const currentMonthStart = startOfMonth(new Date());

            for (let i = 11; i >= 0; i--) {
                const targetDate = sub(currentMonthStart, { months: i });
                const targetYear = getYear(targetDate);
                const targetMonthIndex = getMonth(targetDate);

                const dataPoint = allData.find(d => d.year === targetYear && d.monthIndex === targetMonthIndex);

                last12Months.push({
                    month: monthNames[targetMonthIndex],
                    value: dataPoint ? dataPoint.value : 0, // Default to 0 if data is missing for a month
                });
            }

            return last12Months;

        } catch (error) {
            console.error('Error fetching NDVI data from NASA POWER API:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to fetch NDVI data from NASA POWER API.');
        }
    }
);
