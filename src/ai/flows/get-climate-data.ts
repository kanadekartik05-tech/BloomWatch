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
import { subYears, format } from 'date-fns';
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
            // This check is sufficient. We don't need to check for placeholder values.
            throw new Error('NASA POWER API key is not configured in environment variables.');
        }

        const endDate = new Date();
        const startDate = subYears(endDate, 1);

        const formattedStartDate = format(startDate, 'yyyyMMdd');
        const formattedEndDate = format(endDate, 'yyyyMMdd');

        const parameters = 'T2M,PRECTOTCORR'; // T2M: Temperature at 2m, PRECTOTCORR: Precipitation
        const community = 'RE'; // Renewable Energy
        const formatType = 'JSON';

        const apiUrl = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=${parameters}&community=${community}&longitude=${lon}&latitude=${lat}&start=${formattedStartDate.substring(0, 6)}&end=${formattedEndDate.substring(0, 6)}&format=${formatType}&api_key=${apiKey}`;
        
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

            const result: ClimateDataOutput = Object.keys(t2m).map((key) => {
                const yearMonth = key.slice(0, 6); // YYYYMM
                 if(key.endsWith('13')) return null; // ignore annual average

                const monthIndex = parseInt(yearMonth.slice(4, 6), 10) - 1;

                return {
                    month: monthNames[monthIndex],
                    temperature: t2m[key],
                    rainfall: prectotcorr[key],
                };
            }).filter((item): item is Exclude<typeof item, null> => item !== null);

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
