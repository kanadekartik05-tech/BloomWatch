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
import { subYears, format, getYear, getMonth } from 'date-fns';
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
        const startDate = subYears(endDate, 1);

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

            if (data.error) {
                throw new Error(`NASA POWER API Error for NDVI: ${data.error}`);
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
                };
            }).filter((item): item is Exclude<typeof item, null> => item !== null);
            
            const currentYear = getYear(endDate);
            const currentMonthIndex = getMonth(endDate);

            const last12MonthsData = allData.filter(d => {
                if (d.year === currentYear) {
                    return d.monthIndex <= currentMonthIndex;
                }
                if (d.year === currentYear - 1) {
                    return d.monthIndex > currentMonthIndex;
                }
                return false;
            });
            
            last12MonthsData.sort((a, b) => {
                const aSort = a.year * 100 + a.monthIndex;
                const bSort = b.year * 100 + b.monthIndex;
                if (a.monthIndex > currentMonthIndex && b.monthIndex <= currentMonthIndex) {
                    return -1;
                }
                if (b.monthIndex > currentMonthIndex && a.monthIndex <= currentMonthIndex) {
                    return 1;
                }
                return a.monthIndex - b.monthIndex;
            });
            
            const finalSortedData = [...last12MonthsData].sort((a,b) => {
                let aDate = new Date(a.year, a.monthIndex);
                let bDate = new Date(b.year, b.monthIndex);
                if (aDate < startDate) aDate.setFullYear(aDate.getFullYear() + 1);
                if (bDate < startDate) bDate.setFullYear(bDate.getFullYear() + 1);
                return aDate.getTime() - bDate.getTime();
            });


            return finalSortedData.map(d => ({
                month: d.month,
                value: d.value,
            }));

        } catch (error) {
            console.error('Error fetching NDVI data from NASA POWER API:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to fetch NDVI data from NASA POWER API.');
        }
    }
);
