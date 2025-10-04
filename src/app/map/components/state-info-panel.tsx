
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import type { State, Country, City } from '@/lib/geodata';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, Thermometer, CloudRain, Loader, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAnalysisForCity } from '../actions';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, ComposedChart } from 'recharts';
import type { ClimateDataOutput } from '@/ai/flows/types';
import type { NdviDataOutput } from '@/ai/flows/get-ndvi-data';

type StateInfoPanelProps = {
  state: State | null;
  country: Country | null;
  onBackToCountries: () => void;
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


export function StateInfoPanel({ state, country, onBackToCountries }: StateInfoPanelProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [climateData, setClimateData] = useState<ClimateDataOutput | null>(null);
    const [vegetationData, setVegetationData] = useState<NdviDataOutput | null>(null);

    const representativeCity = useMemo(() => {
        if (!state || !state.cities || state.cities.length === 0) return null;
        return state.cities[0];
    }, [state]);

    useEffect(() => {
        setError(null);
        setClimateData(null);
        setVegetationData(null);

        if (!representativeCity) {
            if (state) {
                 setError("No city data available to analyze for this state.");
            }
            return;
        }

        startTransition(async () => {
            const result = await getAnalysisForCity(representativeCity);
            if (result.success) {
                setClimateData(result.climateData);
                setVegetationData(result.vegetationData);
            } else {
                setError(result.error);
            }
        });

    }, [representativeCity, state]);


  if (!state) {
    return null;
  }

  return (
    <div className="absolute top-0 right-0 z-20 h-full w-full max-w-sm overflow-y-auto bg-background/95 p-4 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-in-out">
        <Card className="flex h-full flex-col border-none bg-transparent shadow-none">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={onBackToCountries}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Countries
                    </Button>
                </div>
                <CardTitle className="mt-4 text-2xl font-bold font-headline">
                {state.name}, {country?.name}
                </CardTitle>
                <CardDescription>
                High-level analysis for {representativeCity ? `the area around ${representativeCity.name}` : 'this region'}.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
                
                {isPending && (
                    <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Fetching real-time analysis...</span>
                    </div>
                )}

                {error && !isPending && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Analysis Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                
                {!isPending && !error && (
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
                    </>
                )}


            </CardContent>
        </Card>
    </div>
  );
}
