
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import type { State, Country, City } from '@/lib/geodata';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, Thermometer, CloudRain, Loader, AlertTriangle, Wand2, Flower, Sprout, PersonStanding } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAnalysisForCity, getBloomPredictionForCity } from '../actions';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, ComposedChart } from 'recharts';
import type { ClimateDataOutput } from '@/ai/flows/types';
import type { NdviDataOutput } from '@/ai/flows/get-ndvi-data';
import type { PredictNextBloomDateOutput } from '@/ai/flows/predict-next-bloom-date';

type CityInfoPanelProps = {
  city: City | null;
  state: State | null;
  country: Country | null;
  isOpen: boolean;
  onBackToStates: () => void;
};

const climateChartConfig: ChartConfig = {
  rainfall: {
    label: 'Rainfall (mm)',
    color: 'hsl(var(--chart-1))',
  },
  temperature: {
    label: 'Temp. (°C)',
    color: 'hsl(var(--chart-2))',
  },
};

const vegetationChartConfig: ChartConfig = {
  value: {
    label: 'Insolation',
    color: 'hsl(var(--primary))',
  },
};


export function CityInfoPanel({ city, state, country, isOpen, onBackToStates }: CityInfoPanelProps) {
    const [isAnalysisPending, startAnalysisTransition] = useTransition();
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [climateData, setClimateData] = useState<ClimateDataOutput | null>(null);
    const [vegetationData, setVegetationData] = useState<NdviDataOutput | null>(null);

    const [isAIPending, startAITransition] = useTransition();
    const [prediction, setPrediction] = useState<PredictNextBloomDateOutput | null>(null);
    const [predictionError, setPredictionError] = useState<string | null>(null);


    useEffect(() => {
        setAnalysisError(null);
        setClimateData(null);
        setVegetationData(null);
        setPrediction(null);
        setPredictionError(null);

        if (!isOpen || !city) {
            return;
        }

        startAnalysisTransition(async () => {
            const result = await getAnalysisForCity(city);
            if (result.success) {
                setClimateData(result.climateData);
                setVegetationData(result.vegetationData);
            } else {
                setAnalysisError(result.error);
            }
        });

    }, [isOpen, city]);

    const handlePredict = () => {
        if (!city || !climateData || !vegetationData) return;
        
        startAITransition(async () => {
          setPrediction(null);
          setPredictionError(null);
          
          const result = await getBloomPredictionForCity(city);
    
          if (result.success && result.data) {
            setPrediction(result.data);
          } else {
            setPredictionError(result.error || 'An unknown error occurred.');
          }
        });
      };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute top-0 right-0 z-20 h-full w-full max-w-sm overflow-y-auto bg-background/95 p-4 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-in-out">
        <Card className="flex h-full flex-col border-none bg-transparent shadow-none">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={onBackToStates}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to States
                    </Button>
                </div>
                <CardTitle className="mt-4 text-2xl font-bold font-headline">
                    {city?.name}
                </CardTitle>
                <CardDescription>
                    {state?.name}, {country?.name}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
                
                {isAnalysisPending && (
                    <div className="flex h-full items-center justify-center space-x-2 text-muted-foreground">
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Fetching real-time analysis...</span>
                    </div>
                )}

                {analysisError && !isAnalysisPending && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Analysis Failed</AlertTitle>
                        <AlertDescription>{analysisError}</AlertDescription>
                    </Alert>
                )}
                
                {!isAnalysisPending && !analysisError && (
                    <>
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Monthly Vegetation Trend
                            </h3>
                            {vegetationData ? (
                                <ChartContainer config={vegetationChartConfig} className="h-48 w-full">
                                    <BarChart data={vegetationData} accessibilityLayer>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
                                        <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12}/>
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dot" />}
                                        />
                                        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <p className="text-sm text-muted-foreground">No vegetation data available.</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                <Thermometer className="h-5 w-5 text-destructive" />
                                <CloudRain className="h-5 w-5 text-blue-500" />
                                Monthly Climate Data
                            </h3>
                             {climateData ? (
                                <ChartContainer config={climateChartConfig} className="h-48 w-full">
                                    <ComposedChart data={climateData} accessibilityLayer>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} fontSize={12}/>
                                        <YAxis yAxisId="left" stroke="var(--color-rainfall)" domain={['auto', 'auto']} tickLine={false} axisLine={false} fontSize={12} />
                                        <YAxis yAxisId="right" orientation="right" stroke="var(--color-temperature)" domain={['auto', 'auto']} tickLine={false} axisLine={false} fontSize={12}/>
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dot" />}
                                        />
                                        <Bar dataKey="rainfall" fill="var(--color-rainfall)" radius={4} yAxisId="left"/>
                                        <Line type="monotone" dataKey="temperature" stroke="var(--color-temperature)" strokeWidth={2} yAxisId="right" />
                                    </ComposedChart>
                                </ChartContainer>
                             ) : (
                                <p className="text-sm text-muted-foreground">No climate data available.</p>
                             )}
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>AI Prediction</CardTitle>
                                <CardDescription>Generate an AI-powered prediction for the next bloom season.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={handlePredict} disabled={isAIPending || isAnalysisPending || !vegetationData}>
                                    {isAIPending ? (
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Wand2 className="mr-2 h-4 w-4" />
                                    )}
                                    Predict Next Blossom Season
                                </Button>
                                {isAIPending && (
                                    <div className="mt-4 flex items-center text-sm text-muted-foreground">
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing data...
                                    </div>
                                )}
                                {predictionError && !isAIPending && (
                                     <Alert variant="destructive" className="mt-4">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Prediction Failed</AlertTitle>
                                        <AlertDescription>{predictionError}</AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {prediction && !isAIPending && (
                            <Card className="shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold text-primary">
                                        Predicted Bloom Date: {new Date(prediction.predictedNextBloomDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </CardTitle>
                                    <CardDescription>{prediction.predictionJustification}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold flex items-center gap-2"><Flower className="text-accent"/>Ecological Significance</h3>
                                        <p className="text-muted-foreground text-sm">{prediction.ecologicalSignificance}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold flex items-center gap-2"><Sprout className="text-accent"/>Potential Species</h3>
                                        <p className="text-muted-foreground text-sm">{prediction.potentialSpecies}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold flex items-center gap-2"><PersonStanding className="text-accent"/>Human Impact</h3>
                                        <p className="text-muted-foreground text-sm">{prediction.humanImpact}</p>

                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}


            </CardContent>
        </Card>
    </div>
  );
}
