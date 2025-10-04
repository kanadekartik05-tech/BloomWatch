
'use client';

import { useState, useMemo, useTransition, useEffect, useCallback } from 'react';
import type { Country, State, City } from '@/lib/geodata';

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
import { Loader, Wand2, PersonStanding, Sprout, Flower, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { PredictNextBloomDateOutput } from '@/ai/flows/types';
import type { NdviDataOutput } from '@/ai/flows/get-ndvi-data';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';


type InsightsViewProps = {
    geodata: Country[];
    allCountries: Country[];
};

type PredictionState = PredictNextBloomDateOutput | null;

const chartConfig: ChartConfig = {
  value: {
    label: 'Insolation', // Updated Label
    color: 'hsl(var(--primary))',
  },
};

export function InsightsView({ geodata, allCountries: extraCountries }: InsightsViewProps) {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  const [selectedCountryName, setSelectedCountryName] = useState<string>('');
  const [selectedStateName, setSelectedStateName] = useState<string>('');
  const [selectedCityName, setSelectedCityName] = useState<string>('');
  const [info, setInfo] = useState<string | null>(null);

  const [prediction, setPrediction] = useState<PredictionState>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [isAIPending, startAITransition] = useTransition();

  const [vegetationData, setVegetationData] = useState<NdviDataOutput | null>(null);
  const [vegetationError, setVegetationError] = useState<string | null>(null);
  const [isVegetationPending, startVegetationTransition] = useTransition();
  
  const allCountries = useMemo(() => {
    const mergedData = [...geodata];
    extraCountries.forEach(country => {
        const existingCountry = mergedData.find(c => c.name === country.name);
        if (!existingCountry) {
            mergedData.push(country);
        }
    });
    mergedData.sort((a, b) => a.name.localeCompare(b.name));
    return mergedData;
  }, [geodata, extraCountries]);

  const countryOptions = useMemo(() => allCountries.map(c => ({ value: c.name, label: c.name })), [allCountries]);
  const stateOptions = useMemo(() => states.map(s => ({ value: s.name, label: s.name })), [states]);
  const cityOptions = useMemo(() => cities.map(c => ({ value: c.name, label: c.name })), [cities]);
  
  const selectedCountry = useMemo(() => allCountries.find(c => c.name.toLowerCase() === selectedCountryName.toLowerCase()), [allCountries, selectedCountryName]);
  const selectedState = useMemo(() => states.find(s => s.name.toLowerCase() === selectedStateName.toLowerCase()), [states, selectedStateName]);
  const selectedCity = useMemo(() => cities.find(c => c.name.toLowerCase() === selectedCityName.toLowerCase()), [cities, selectedCityName]);

  const representativeLocation = useMemo(() => {
    if (selectedCity) return selectedCity;
    if (selectedState && selectedState.cities && selectedState.cities.length > 0) {
      return selectedState.cities[0];
    }
    return null;
  }, [selectedCity, selectedState]);


  const resetSelection = (level: 'country' | 'state' | 'city') => {
    setPrediction(null);
    setPredictionError(null);
    setVegetationData(null);
    setVegetationError(null);
    setInfo(null);
    
    if (level === 'country') {
      setSelectedCountryName('');
      setStates([]);
    }
    if (level === 'state' || level === 'country') {
      setSelectedStateName('');
      setCities([]);
    }
    if (level === 'city' || level === 'state' || level === 'country') {
      setSelectedCityName('');
    }
  }

  const handleSelectCountry = useCallback((countryName: string) => {
    resetSelection('state');
    setSelectedCountryName(countryName);
    const country = allCountries.find(c => c.name.toLowerCase() === countryName.toLowerCase());
    
    if (country && country.states && country.states.length > 0) {
        setStates(country.states);
    } else {
        setInfo("Data for this country is not yet available. We are working on it!");
        setStates([]);
    }
  }, [allCountries]);

  const handleSelectState = useCallback((stateName: string) => {
    resetSelection('city');
    setSelectedStateName(stateName);
    const state = states.find(s => s.name.toLowerCase() === stateName.toLowerCase());
    if(state) {
        setCities(state.cities || []);
    }
  }, [states]);
  
  const handleSelectCity = useCallback((cityName: string) => {
      setSelectedCityName(cityName);
      setInfo(null);
  }, []);


  useEffect(() => {
    if (!representativeLocation) {
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
            lat: representativeLocation.lat,
            lon: representativeLocation.lon,
        });

        if (result.success) {
            setVegetationData(result.data);
        } else {
            setVegetationError(result.error);
        }
    });

  }, [representativeLocation]);

  const peakInsolation = useMemo(() => {
    if (!vegetationData) return 0;
    return Math.max(...vegetationData.map(d => d.value))
  }, [vegetationData]);
  
  const locationForAI = selectedCity || selectedState;
  const locationNameForAI = selectedCity?.name || selectedState?.name;


  const handlePredict = () => {
    if (!vegetationData || !representativeLocation || !locationNameForAI) return;
    startAITransition(async () => {
      setPrediction(null);
      setPredictionError(null);
      
      const result = await getEnhancedBloomPrediction({
        cityName: locationNameForAI,
        lat: representativeLocation.lat,
        lon: representativeLocation.lon,
        ndviData: vegetationData,
      });

      if (result.success && result.data) {
        setPrediction(result.data);
      } else {
        setPredictionError(result.error || 'An unknown error occurred.');
      }
    });
  };
  
  const cardTitle = useMemo(() => {
    if (selectedCity) return `Monthly Insolation Trend for ${selectedCity.name}`;
    if (selectedState) return `Monthly Insolation Trend for ${selectedState.name}`;
    return "Monthly Insolation Trend";
  }, [selectedCity, selectedState]);

  const cardDescription = useMemo(() => {
    if (selectedCity) return "All sky insolation from NASA POWER API, a proxy for vegetation health.";
    if (selectedState) return `Using data from a representative city in ${selectedState.name}.`;
    return "Select a location to see its vegetation data.";
  }, [selectedCity, selectedState]);


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Location Selection</CardTitle>
          <CardDescription>Choose a location to analyze its vegetation data and generate AI-powered insights.</CardDescription>
        </CardHeader>
        <CardContent className="w-full md:w-96 space-y-4">
             <Combobox
                options={countryOptions}
                value={selectedCountryName}
                onChange={handleSelectCountry}
                placeholder="Select a Country"
                searchPlaceholder="Search countries..."
                emptyPlaceholder="No country found."
            />

            <Combobox
                options={stateOptions}
                value={selectedStateName}
                onChange={handleSelectState}
                placeholder="Select a State"
                searchPlaceholder="Search states..."
                emptyPlaceholder="No state found."
                disabled={!selectedCountry || states.length === 0}
            />

            <Combobox
                options={cityOptions}
                value={selectedCityName}
                onChange={handleSelectCity}
                placeholder="Select a City"
                searchPlaceholder="Search cities..."
                emptyPlaceholder="No city found."
                disabled={!selectedState || cities.length === 0}
            />
             {info && (
              <Alert className="mt-2">
                <Info className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>{info}</AlertDescription>
              </Alert>
            )}
        </CardContent>
      </Card>
      
      {(selectedState || selectedCity) && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>{cardTitle}</CardTitle>
                <CardDescription>{cardDescription}</CardDescription>
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
                    Predicted Bloom Date for {locationNameForAI}: {new Date(prediction.predictedNextBloomDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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

    