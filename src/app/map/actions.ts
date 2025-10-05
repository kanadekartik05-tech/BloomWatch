
'use server';

import { predictNextBloomDate } from "@/ai/flows/predict-next-bloom-date";
import type { PredictNextBloomDateInput, PredictNextBloomDateOutput } from "@/ai/flows/types";
import { getClimateData } from "@/ai/flows/get-climate-data";
import { getNdviData, type NdviDataOutput } from "@/ai/flows/get-ndvi-data";
import { summarizeChartData } from "@/ai/flows/summarize-chart-data";
import type { ChartDataSummaryInput, ChartDataSummaryOutput, ClimateDataInput, ClimateDataOutput } from "@/ai/flows/types";
import type { City } from "@/lib/geodata";
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

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

async function logHistoryEvent(
    type: 'PREDICTION' | 'ANALYSIS' | 'CLIMATE_SUMMARY',
    regionName: string,
    predictedDate?: string
) {
    try {
        const { auth, firestore } = initializeFirebase();
        const currentUser = auth.currentUser;
        if (currentUser) {
            const historyCollection = collection(firestore, 'users', currentUser.uid, 'history');
            const eventData: any = {
                type,
                regionName,
                createdAt: serverTimestamp(),
            };
            if (predictedDate) {
                eventData.predictedDate = predictedDate;
            }
            await addDoc(historyCollection, eventData);
        }
    } catch (error) {
        console.error("Failed to log history event:", error);
    }
}


export async function getAnalysisForCity(city: City, startDate?: string, endDate?: string): Promise<CityAnalysisResult> {
     try {
        const climateInput: ClimateDataInput = { lat: city.lat, lon: city.lon, startDate, endDate };

        // Fetch vegetation and climate data in parallel
        const [ndviResult, climateResult] = await Promise.all([
            getNdviData(climateInput),
            getClimateData(climateInput)
        ]);

        if (ndviResult.length === 0) {
            return { success: false, error: "No vegetation data was found for this location." };
        }

        logHistoryEvent('ANALYSIS', city.name);

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


export async function getBloomPredictionForCity(city: City): Promise<PredictionResult> {
    try {
        const climateInput: ClimateDataInput = { lat: city.lat, lon: city.lon };

        // Fetch vegetation and climate data in parallel
        const [ndviResult, climateResult] = await Promise.all([
            getNdviData(climateInput),
            getClimateData(climateInput)
        ]);

        if (ndviResult.length === 0) {
            return { success: false, error: "No vegetation data was found for this location. It may be over a large body of water or have other data availability issues." };
        }

        // We need a dummy latest bloom date. In a real scenario, this would come from a database.
        const dummyLatestBloom = `${new Date().getFullYear()}-04-01`;

        const predictionInput: PredictNextBloomDateInput = {
            regionName: city.name,
            lat: city.lat,
            lon: city.lon,
            ndviData: ndviResult.map(d => ({ month: d.month, value: d.value })),
            latestBloomDate: dummyLatestBloom,
            climateData: climateResult,
        };
        
        const result = await predictNextBloomDate(predictionInput);

        logHistoryEvent('PREDICTION', city.name, result.predictedNextBloomDate);

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

export async function getChartSummary(input: ChartDataSummaryInput): Promise<SummaryResult> {
    try {
        const result = await summarizeChartData(input);

        logHistoryEvent('CLIMATE_SUMMARY', input.locationName);

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
