
'use server';

import { predictNextBloomDate } from "@/ai/flows/predict-next-bloom-date";
import type { PredictNextBloomDateInput, PredictNextBloomDateOutput } from "@/ai/flows/types";
import { getClimateData } from "@/ai/flows/get-climate-data";
import { getNdviData, type NdviDataOutput } from "@/ai/flows/get-ndvi-data";
import { summarizeChartData } from "@/ai/flows/summarize-chart-data";
import type { ChartDataSummaryInput, ChartDataSummaryOutput, ClimateDataInput, ClimateDataOutput } from "@/ai/flows/types";
import type { City, Country, State } from "@/lib/geodata";
import { initializeFirebaseAdmin } from '@/firebase/server-init';
import { getFirestore } from 'firebase-admin/firestore';


type PredictionResult = {
    success: true;
    data: PredictNextBloomDateOutput;
} | {
    success: false;
    error: string;
};

type CityAnalysisResult = {
    success: true;
    climateData: ClimateDataOutput;
    vegetationData: NdviDataOutput;
} | {
    success: false;
    error: string;
};

type SummaryResult = {
    success: true;
    data: ChartDataSummaryOutput;
} | {
    success: false;
    error: string;
}

type HistoryLogInput = {
    userId: string;
    type: 'PREDICTION' | 'ANALYSIS' | 'CLIMATE_SUMMARY';
    city: City;
    state?: State | null;
    country?: Country | null;
    prediction?: PredictNextBloomDateOutput;
    summary?: string;
};


async function logHistoryEvent(input: HistoryLogInput) {
    const { userId, type, city, state, country, prediction, summary } = input;
    try {
        await initializeFirebaseAdmin();
        const firestore = getFirestore();
        const historyCollection = firestore.collection('users').doc(userId).collection('history');
        
        const eventData: any = {
            type,
            regionName: city.name,
            city: city.name,
            state: state?.name || null,
            country: country?.name || null,
            createdAt: new Date(),
        };

        if (prediction) {
            eventData.prediction = prediction;
        }
        if (summary) {
            eventData.summary = summary;
        }

        await historyCollection.add(eventData);
    } catch (error) {
        console.error("Failed to log history event:", error);
    }
}


export async function getAnalysisForCity(
    city: City,
    state: State | null,
    country: Country | null,
    userId?: string,
    startDate?: string,
    endDate?: string
): Promise<CityAnalysisResult> {
     try {
        const climateInput: ClimateDataInput = { lat: city.lat, lon: city.lon, startDate, endDate };

        const [ndviResult, climateResult] = await Promise.all([
            getNdviData(climateInput),
            getClimateData(climateInput)
        ]);

        if (ndviResult.length === 0) {
            return { success: false, error: "No vegetation data was found for this location." };
        }

        if (userId) {
            await logHistoryEvent({ userId, type: 'ANALYSIS', city, state, country });
        }

        return {
            success: true,
            climateData: climateResult,
            vegetationData: ndviResult
        };

    } catch (error) {
        console.error("Error getting city analysis data:", error);
        
        let errorMessage = "Failed to fetch analysis data. The location may not be supported.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}


export async function getBloomPredictionForCity(
    city: City,
    state: State | null,
    country: Country | null,
    userId?: string,
    startDate?: string,
    endDate?: string
): Promise<PredictionResult> {
    try {
        const climateInput: ClimateDataInput = { lat: city.lat, lon: city.lon, startDate, endDate };

        const [ndviResult, climateResult] = await Promise.all([
            getNdviData(climateInput),
            getClimateData(climateInput)
        ]);

        if (ndviResult.length === 0) {
            return { success: false, error: "No vegetation data was found for this location. It may be over a large body of water or have other data availability issues." };
        }

        const dummyLatestBloom = `${new Date().getFullYear()}-04-01`;

        const predictionInput: PredictNextBloomDateInput = {
            regionName: city.name,
            lat: city.lat,
            lon: city.lon,
            ndviData: ndviResult.map(d => ({ month: d.month, value: d.value, date: d.date })),
            latestBloomDate: dummyLatestBloom,
            climateData: climateResult,
        };
        
        const result = await predictNextBloomDate(predictionInput);

        if (userId) {
            await logHistoryEvent({ userId, type: 'PREDICTION', city, state, country, prediction: result });
        }

        return { success: true, data: result };

    } catch (error) {
        console.error("Error getting bloom prediction for city:", error);
        
        let errorMessage = "Failed to get prediction from AI. The model may be unavailable or the location is not supported.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}

export async function getChartSummary(
    input: ChartDataSummaryInput,
    city: City,
    state: State | null,
    country: Country | null,
    userId?: string
): Promise<SummaryResult> {
    try {
        const result = await summarizeChartData(input);

        if (userId) {
            await logHistoryEvent({ userId, type: 'CLIMATE_SUMMARY', city, state, country, summary: result.summary });
        }

        return { success: true, data: result };
    } catch(error) {
        console.error("Error getting chart summary:", error);
        let errorMessage = "Failed to generate summary from AI.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
    }
}

    