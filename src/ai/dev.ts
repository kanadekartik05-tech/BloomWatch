'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/predict-next-bloom-date.ts';
import '@/ai/flows/get-climate-data.ts';
import '@/ai/flows/get-ndvi-data.ts';
import '@/ai/flows/summarize-chart-data.ts';
import '@/ai/flows/get-batch-predictions.ts';
