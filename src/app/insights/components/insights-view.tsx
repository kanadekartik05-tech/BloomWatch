
'use client';

import { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
import type { Country, State, City } from '@/lib/geodata';
import { MapSearch } from '@/app/map/components/map-search';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts';
import { Button } from '@/components/ui/button';
import { getEnhancedBloomPrediction, fetchNdviDataForRegion } from '../actions';
import { Loader, Wand2, PersonStanding, Sprout, Flower } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { PredictNextBloomDateOutput } from '@/ai/flows/types';
import type { NdviDataOutput } from '@/ai/flows/get-ndvi-data';

type InsightsViewProps = {
    geodata: Country[];
    allCountries: Country[];
};

type PredictionState = PredictNextBloomDateOutput | null;
type ViewLevel = 'country' | 'state' | 'city';

const chartConfig: ChartConfig = {
  value: {
    label: 'Insolation', // Updated Label
    color: 'hsl(var(--primary))',
  },
};

export function InsightsView({ geodata, allCountries }: InsightsViewProps) {
  const [viewLevel, setViewLevel] = useState<ViewLevel>('country');
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const [prediction, setPrediction] = useState<PredictionState>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [isAIPending, startAITransition] = useTransition();

  const [vegetationData, setVegetationData] = useState<NdviDataOutput | null>(null);
  const [vegetationError, setVegetationError] = useState<string | null>(null);
  const [isVegetationPending, startVegetationTransition] = useTransition();

  const resetSelection = (level: 'country' | 'state' | 'city') => {
    if (level === 'country') {
      setSelectedCountry(null);
      setSelectedState(null);
      setSelectedCity(null);
      setStates([]);
      setCities([]);
    }
    if (level === 'state') {
       setSelectedState(null);
       setSelectedCity(null);
       setCities([]);
    }
    if (level === 'city') {
       setSelectedCity(null);
    }
    setPrediction(null);
    setPredictionError(null);
    setVegetationData(null);
    setVegetationError(null);
  }

  const handleSelectCountry = useCallback((country: Country) => {
    setSelectedCountry(country);
    if (country.states && country.states.length > 0) {
        setViewLevel('state');
        resetSelection('state');
        setStates(country.states || []);
    } else {
        setViewLevel('country');
        setVegetationError("Data for this country is not yet available. We are working on it!");
        setStates([]);
        setCities([]);
        setSelectedState(null);
        setSelectedCity(null);
    }
  }, []);

  const handleSelectState = useCallback((state: State) => {
    if (!selectedCountry) return;
    setSelectedState(state);
    setViewLevel('city');
    resetSelection('city');
    setCities(state.cities || []);
  }, [selectedCountry]);
  
  const handleSelectCity = useCallback((city: City) => {
      setSelectedCity(city);
  }, []);

  const handleBackToCountries = () => {
    setViewLevel('country');
    resetSelection('country');
  };

  const handleBackToStates = () => {
    if (!selectedCountry) return;
    setViewLevel('state');
    resetSelection('city');
  };

  useEffect(() => {
    if (!selectedCity) {
      setVegetationData(null);
      setPrediction(null);
      setVegetationError(null);
      setPredictionError(null);
      return
    };

    startVegetationTransition(async () => {
        setVegetationData(null);
        setPrediction(null);
        setVegetationError(null);
        setPredictionError(null);

        const result = await fetchNdviDataForRegion({
            lat: selectedCity.lat,
            lon: selectedCity.lon,
        });

        if (result.success) {
            setVegetationData(result.data);
        } else {
            setVegetationError(result.error);
        }
    });

  }, [selectedCity]);

  const peakInsolation = useMemo(() => {
    if (!vegetationData) return 0;
    return Math.max(...vegetationData.map(d => d.value))
  }, [vegetationData]);

  const handlePredict = () => {
    if (!vegetationData || !selectedCity) return;
    startAITransition(async () => {
      setPrediction(null);
      setPredictionError(null);
      
      const result = await getEnhancedBloomPrediction({
        cityName: selectedCity.name,
        lat: selectedCity.lat,
        lon: selectedCity.lon,
        ndviData: vegetationData,
      });

      if (result.success && result.data) {
        setPrediction(result.data);
      } else {
        setPredictionError(result.error || 'An unknown error occurred.');
      }
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Location Selection</CardTitle>
          <CardDescription>Choose a location to analyze its vegetation data and generate AI-powered insights.</CardDescription>
        </CardHeader>
        <CardContent className="w-full md:w-96">
            <MapSearch
                viewLevel={viewLevel}
                countries={allCountries}
                states={states}
                cities={cities}
                loadingStates={false}
                loadingCities={false}
                selectedCountry={selectedCountry}
                selectedState={selectedState}
                onSelectCountry={handleSelectCountry}
                onSelectState={handleSelectState}
                onSelectCity={handleSelectCity}
                onBackToCountries={handleBackToCountries}
                onBackToStates={handleBackToStates}
            />
        </CardContent>
      </Card>
      
      {selectedCity && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Monthly Insolation Trend for {selectedCity.name}</CardTitle>
                <CardDescription>All sky insolation from NASA POWER API, a proxy for vegetation health.</CardDescription>
            </CardHeader>
            <CardContent>
                {isVegetationPending && (
                    <div className="flex h-72 w-full items-center justify-center text-muted-foreground">
                        <Loader className="mr-2 h-6 w-6 animate-spin" />
                        Fetching real-time vegetation proxy data from NASA...
                    </div>
                )}
                {vegetationError && !isVegetationPending && (
                    <Alert variant="destructive">
                        <AlertTitle>Failed to Fetch Vegetation Data</AlertTitle>
                        <AlertDescription>{vegetationError}</AlertDescription>
                    </Alert>
                )}
                {vegetationData && !isVegetationPending && (
                <ChartContainer config={chartConfig} className="h-72 w-full">
                    <BarChart data={vegetationData} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    {peakInsolation > 0 && <ReferenceLine y={peakInsolation} label={{ value: 'Peak Proxy', position: 'insideTopLeft', fill: 'hsl(var(--foreground))', dy: -10, dx: 10 }} stroke="hsl(var(--accent))" strokeDasharray="3 3" />}
                    <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                    </BarChart>
                </ChartContainer>
                )}
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>Predict the next bloom event and understand its context.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
                <Button onClick={handlePredict} disabled={isAIPending || isVegetationPending || !vegetationData}>
                {isAIPending ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Insights
                </Button>
                
                {isAIPending && (
                    <div className="flex items-center text-sm text-muted-foreground p-4 border rounded-lg">
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing climate and vegetation data to generate prediction...
                    </div>
                )}
                
                {predictionError && !isAIPending &&(
                    <Alert variant="destructive">
                        <AlertTitle>Prediction Failed</AlertTitle>
                        <AlertDescription>{predictionError}</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            </Card>
        </div>
      )}

      {prediction && !isAIPending && (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">
                    Predicted Bloom Date for {selectedCity?.name}: {new Date(prediction.predictedNextBloomDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </CardTitle>
                <CardDescription>{prediction.predictionJustification}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </div>
  );
}
