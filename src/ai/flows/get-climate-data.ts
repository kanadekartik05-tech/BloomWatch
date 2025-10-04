'use server';

/**
 * @fileOverview Fetches climate data from the NASA POWER API for a given region.
 * 
 * - getClimateData - A function that fetches climate data.
 * - ClimateDataInput - The input type for the getClimateData function.
 * - ClimateDataOutput - The return type for the getClimateData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';
import { subYears, format, getYear, getMonth } from 'date-fns';
import { ClimateDataInputSchema, ClimateDataOutputSchema, type ClimateDataOutput, type ClimateDataInput } from './types';


export async function getClimateData(input: ClimateDataInput): Promise<ClimateDataOutput> {
    return getClimateDataFlow(input);
}

const getClimateDataFlow = ai.defineFlow(
    {
        name: 'getClimateDataFlow',
        inputSchema: ClimateDataInputSchema,
        outputSchema: ClimateDataOutputSchema,
    },
    async ({ lat, lon }) => {
        const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;
        if (!apiKey) {
            throw new Error('NASA POWER API key is not configured in environment variables.');
        }

        const endDate = new Date();
        const startDate = subYears(endDate, 1);

        const startYear = format(startDate, 'yyyy');
        const endYear = format(endDate, 'yyyy');

        const parameters = 'T2M,PRECTOTCORR'; // T2M: Temperature at 2m, PRECTOTCORR: Precipitation
        const community = 'RE'; // Renewable Energy
        const formatType = 'JSON';

        const apiUrl = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=${parameters}&community=${community}&longitude=${lon}&latitude=${lat}&start=${startYear}&end=${endYear}&format=${formatType}&api_key=${apiKey}`;
        
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                const errorText = await response.text();
                // Check if the error is due to an invalid API key
                if (errorText.includes("Invalid API key")) {
                     throw new Error('The provided NASA POWER API key is invalid. Please check your key and try again.');
                }
                throw new Error(`NASA POWER API request failed with status ${response.status}: ${errorText}`);
            }
            const data: any = await response.json();

            // Handle cases where the API returns an error object
            if (data.error) {
                throw new Error(`NASA POWER API Error: ${data.error}`);
            }

            if (!data.properties || !data.properties.parameter) {
                throw new Error('Unexpected response format from NASA POWER API.');
            }

            const t2m = data.properties.parameter.T2M;
            const prectotcorr = data.properties.parameter.PRECTOTCORR;

            if (!t2m || !prectotcorr) {
                throw new Error('Climate data (T2M or PRECTOTCORR) not found in NASA POWER API response.');
            }
            
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            const allData = Object.keys(t2m).map((key) => {
                 if(key.endsWith('13')) return null; // ignore annual average
                
                const year = parseInt(key.slice(0, 4), 10);
                const monthIndex = parseInt(key.slice(4, 6), 10) - 1;

                return {
                    year,
                    month: monthNames[monthIndex],
                    monthIndex,
                    temperature: t2m[key],
                    rainfall: prectotcorr[key],
                };
            }).filter((item): item is Exclude<typeof item, null> => item !== null);

            // Filter to get the last 12 months of data
            const currentYear = getYear(endDate);
            const currentMonthIndex = getMonth(endDate); // 0-11

            const last12MonthsData = allData.filter(d => {
                if (d.year === currentYear) {
                    return d.monthIndex <= currentMonthIndex;
                }
                if (d.year === currentYear - 1) {
                    return d.monthIndex > currentMonthIndex;
                }
                return false;
            });
            
            // Sort the data chronologically
            last12MonthsData.sort((a, b) => {
                if (a.year !== b.year) {
                    return a.year - b.year;
                }
                return a.monthIndex - b.monthIndex;
            });

            // Format for output
            const result: ClimateDataOutput = last12MonthsData.map(d => ({
                month: d.month,
                temperature: d.temperature,
                rainfall: d.rainfall,
            }));

            return result;

        } catch (error) {
            console.error('Error fetching data from NASA POWER API:', error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to fetch climate data from NASA POWER API.');
        }
    }
);
