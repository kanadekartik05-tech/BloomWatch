'use server';

/**
 * @fileOverview Fetches vegetation-related data from the NASA POWER API.
 * This flow now fetches 'All Sky Insolation' as a proxy for vegetation health,
 * as the NDVI parameter is not available through this specific API endpoint.
 * 
 * - getNdviData - A function that fetches the data.
 * - ClimateDataInput - The input type (reused for lat/lon).
 * - NdviDataOutput - The return type for the getNdviData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';
import { sub, format, getYear, getMonth, startOfMonth } from 'date-fns';
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
        
        const endDate = new Date();
        const startDate = sub(endDate, { years: 2 });

        const startYear = format(startDate, 'yyyy');
        const endYear = format(endDate, 'yyyy');

        // CORRECT PARAMETER: Using 'ALLSKY_SFC_SW_DWN' which is available.
        const parameters = 'ALLSKY_SFC_SW_DWN'; 
        const community = 'RE'; // Renewable Energy community is correct.

        const formatType = 'JSON';

        let apiUrl = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=${parameters}&community=${community}&longitude=${lon}&latitude=${lat}&start=${startYear}&end=${endYear}&format=${formatType}`;
        
        if (apiKey && apiKey !== "YOUR_NASA_API_KEY_HERE" && apiKey.length > 5) {
            apiUrl += `&api_key=${apiKey}`;
        }
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`NASA POWER API request failed for Insolation data with status ${response.status}: ${errorText}`);
            }
            const data: any = await response.json();

            if (data.header && data.header.api_message) {
                 if (data.header.api_message.includes("No data was found for the requested time period")) {
                    return [];
                 }
            }

            if (data.error || (data.messages && data.messages.length > 0 && !data.properties)) {
                const errorMessage = data.error || (data.messages && data.messages.join(', '));
                throw new Error(`NASA POWER API Error for Insolation data: ${errorMessage}`);
            }
            
            const insolationData = data.properties.parameter.ALLSKY_SFC_SW_DWN;

            if (!insolationData) {
                throw new Error('Insolation data not found in NASA POWER API response.');
            }
            
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            const allData = Object.keys(insolationData).map((key) => {
                 if(key.endsWith('13')) return null;
                
                const year = parseInt(key.slice(0, 4), 10);
                const monthIndex = parseInt(key.slice(4, 6), 10) - 1;

                const value = insolationData[key] > -99 ? insolationData[key] : 0;

                return {
                    year,
                    month: monthNames[monthIndex],
                    monthIndex,
                    value: value,
                    date: new Date(year, monthIndex)
                };
            }).filter((item): item is Exclude<typeof item, null> => item !== null);
            
            const last12Months: {month: string, value: number}[] = [];
            const currentMonthStart = startOfMonth(new Date());

            for (let i = 11; i >= 0; i--) {
                const targetDate = sub(currentMonthStart, { months: i });
                const targetYear = getYear(targetDate);
                const targetMonthIndex = getMonth(targetDate);

                const dataPoint = allData.find(d => d.year === targetYear && d.monthIndex === targetMonthIndex);

                last12Months.push({
                    month: monthNames[targetMonthIndex],
                    value: dataPoint ? dataPoint.value : 0,
                });
            }

            return last12Months;

        } catch (error) {
            console.error('Error fetching Insolation data from NASA POWER API:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to fetch Insolation data from NASA POWER API.');
        }
    }
);
