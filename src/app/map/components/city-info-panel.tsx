
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import type { State, Country, City } from '@/lib/geodata';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, Thermometer, CloudRain, Loader, AlertTriangle, Wand2, Flower, Sprout, PersonStanding, X, Maximize, CalendarIcon, MessageSquareText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAnalysisForCity, getBloomPredictionForCity, getChartSummary } from '../actions';
import type { PredictNextBloomDateOutput } from '@/ai/flows/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useUser } from '@/firebase';


type CityInfoPanelProps = {
  city: City | null;
  state: State | null;
  country: Country | null;
  onBackToStates: () => void;
  onClose: () => void;
};

export function CityInfoPanel({ city, state, country, onBackToStates, onClose }: CityInfoPanelProps) {
    const { user } = useUser();
    
    const [isAIPending, startAITransition] = useTransition();
    const [prediction, setPrediction] = useState<PredictNextBloomDateOutput | null>(null);
    const [predictionError, setPredictionError] = useState<string | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    useEffect(() => {
        // Reset state when city changes
        setStartDate(undefined);
        setEndDate(undefined);
        setPrediction(null);
        setPredictionError(null);
    }, [city]);

    const handlePredict = () => {
        if (!city) return;
        
        startAITransition(async () => {
          setPrediction(null);
          setPredictionError(null);
          
          const start = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
          const end = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;

          const result = await getBloomPredictionForCity(city, state, country, user?.uid, start, end);
    
          if (result.success && result.data) {
            setPrediction(result.data);
          } else {
            setPredictionError(result.error || 'An unknown error occurred.');
          }
        });
      };
    
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
                    <Button variant="ghost" size="sm" onClick={onBackToStates}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to States
                    </Button>
                )}
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullScreen(!isFullScreen)}>
                        <Maximize className="h-4 w-4" />
                    </Button>
                   {!isFullScreen && (
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                   )}
                </div>
            </div>
            <CardTitle className="mt-2 text-2xl font-bold font-headline">
                {city?.name}
            </CardTitle>
            <CardDescription>
                {state?.name}, {country?.name}
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
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>AI Botanical Analysis</CardTitle>
                    <CardDescription>Get AI-powered suggestions for suitable flower species based on the selected date range.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handlePredict} disabled={isAIPending}>
                        {isAIPending ? (
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Analyze Region
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
                            <AlertTitle>Analysis Failed</AlertTitle>
                            <AlertDescription>{predictionError}</AlertDescription>
                         </Alert>
                    )}
                </CardContent>
            </Card>

            {prediction && !isAIPending && (
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                           <Flower className="h-6 w-6"/> AI Analysis
                        </CardTitle>
                        <CardDescription>{prediction.predictionJustification}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2"><Sprout className="text-accent"/>Suitable Flower Species</h3>
                            <p className="text-muted-foreground text-sm">{prediction.potentialSpecies}</p>

                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2"><Flower className="text-accent"/>Ecological Significance</h3>
                            <p className="text-muted-foreground text-sm">{prediction.ecologicalSignificance}</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2"><PersonStanding className="text-accent"/>Human Impact</h3>
                            <p className="text-muted-foreground text-sm">{prediction.humanImpact}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </CardContent>
    </Card>
  );
}
