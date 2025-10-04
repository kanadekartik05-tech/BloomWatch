
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import type { State, Country, City } from '@/lib/geodata';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, Thermometer, CloudRain, Loader, AlertTriangle, X, Maximize, Wand2, Flower, Sprout, PersonStanding, CalendarIcon, MessageSquareText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAnalysisForCity, getBloomPredictionForCity, getChartSummary } from '../actions';
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
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

type StateInfoPanelProps = {
  state: State | null;
  country: Country | null;
  onBackToCountries: () => void;
  onClose: () => void;
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


export function StateInfoPanel({ state, country, onBackToCountries, onClose }: StateInfoPanelProps) {
    const [isAnalysisPending, startAnalysisTransition] = useTransition();
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [climateData, setClimateData] = useState<ClimateDataOutput | null>(null);
    const [vegetationData, setVegetationData] = useState<NdviDataOutput | null>(null);

    const [isSummaryPending, startSummaryTransition] = useTransition();
    const [summary, setSummary] = useState<string | null>(null);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const [isAIPending, startAITransition] = useTransition();
    const [prediction, setPrediction] = useState<PredictNextBloomDateOutput | null>(null);
    const [predictionError, setPredictionError] = useState<string | null>(null);
    
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    const representativeCity = useMemo(() => {
        if (!state || !state.cities || state.cities.length === 0) return null;
        // A simple heuristic: pick the first city. A better one might be to find the capital.
        return state.cities[0];
    }, [state]);

    const fetchAnalysisData = () => {
        setAnalysisError(null);
        setClimateData(null);
        setVegetationData(null);
        setPrediction(null);
        setPredictionError(null);
        setSummary(null);
        setSummaryError(null);
        if (!representativeCity) {
            if (state) {
                 setAnalysisError("No city data available to analyze for this state.");
            }
            return;
        }

        startAnalysisTransition(async () => {
            const start = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
            const end = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;
            const result = await getAnalysisForCity(representativeCity, start, end);
            if (result.success) {
                setClimateData(result.climateData);
                setVegetationData(result.vegetationData);
            } else {
                setAnalysisError(result.error);
            }
        });
    }

    useEffect(() => {
        setStartDate(undefined);
        setEndDate(undefined); 

        if(representativeCity || state) {
            fetchAnalysisData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [representativeCity, state]);
    
    const handlePredict = () => {
        if (!representativeCity) return;
        
        startAITransition(async () => {
          setPrediction(null);
          setPredictionError(null);
          
          const result = await getBloomPredictionForCity(representativeCity);
    
          if (result.success && result.data) {
            setPrediction(result.data);
          } else {
            setPredictionError(result.error || 'An unknown error occurred.');
          }
        });
      };

    const handleGenerateSummary = () => {
        if (!state || !climateData || !vegetationData) return;

        startSummaryTransition(async () => {
            setSummary(null);
            setSummaryError(null);
            const result = await getChartSummary({
                locationName: state.name,
                climateData,
                vegetationData,
            });
            if (result.success) {
                setSummary(result.data.summary);
            } else {
                setSummaryError(result.error);
            }
        });
    }


  return (
    <Card className={cn(
        "absolute right-4 top-20 z-10 w-full max-w-sm animate-in slide-in-from-right",
        isFullScreen && "fixed inset-0 top-14 z-50 h-[calc(100vh-3.5rem)] max-w-full animate-none rounded-none"
    )}>
        <CardHeader>
            <div className="flex items-center justify-between">
                {isFullScreen ? (
                     <Button variant="ghost" size="sm" onClick={() => setIsFullScreen(false)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Map
                    </Button>
                ) : (
                    <Button variant="ghost" size="sm" onClick={onBackToCountries}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Countries
                    </Button>
                )}
                
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullScreen(!isFullScreen)}>
                        <Maximize className="h-4 w-4" />
                    </Button>
                   {!isFullScreen && (
                     <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                   )}
                </div>
            </div>
            <CardTitle className="mt-2 text-2xl font-bold font-headline">
            {state?.name}, {country?.name}
            </CardTitle>
            <CardDescription>
            High-level analysis {representativeCity ? `for the area around ${representativeCity.name}` : 'for this region'}.
            </CardDescription>
        </CardHeader>
        <CardContent className={cn(
            "flex h-[calc(100vh-20rem)] flex-col space-y-6 overflow-y-auto",
            isFullScreen && "h-full"
        )}>

            <div className="space-y-4 rounded-lg border p-4">
                 <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "LLL dd, y") : <span>Start date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            disabled={{ after: endDate || new Date() }}
                            numberOfMonths={1}
                        />
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "LLL dd, y") : <span>End date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            disabled={{ before: startDate, after: new Date() }}
                            numberOfMonths={1}
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                <Button onClick={fetchAnalysisData} disabled={isAnalysisPending} className="w-full">
                    {isAnalysisPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Submit
                </Button>
            </div>
            
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
            
            {!isAnalysisPending && !analysisError && climateData && vegetationData && (
                <>
                    <div className="space-y-2">
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

                    <div className="space-y-2">
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
                    
                    <div className="space-y-4">
                        <Button onClick={handleGenerateSummary} disabled={isSummaryPending || isAnalysisPending || !climateData || !vegetationData} className="w-full">
                            {isSummaryPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquareText className="mr-2 h-4 w-4" />}
                            Generate Short Reply
                        </Button>
                        {isSummaryPending && (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                Generating summary...
                            </div>
                        )}
                        {summaryError && !isSummaryPending && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Summary Failed</AlertTitle>
                                <AlertDescription>{summaryError}</AlertDescription>
                            </Alert>
                        )}
                        {summary && !isSummaryPending && (
                            <Alert>
                                <AlertTitle>Analysis Summary</AlertTitle>
                                <AlertDescription>{summary}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>AI Prediction</CardTitle>
                            <CardDescription>Generate an AI-powered prediction for the next bloom season.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handlePredict} disabled={isAIPending || isAnalysisPending || !vegetationData || !representativeCity}>
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
  );
}
