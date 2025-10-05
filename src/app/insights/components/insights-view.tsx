
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
import { getBloomAnalysis, fetchNdviDataForRegion } from '../actions';
import { Loader, Wand2, Info, AlertTriangle, Flower, Sprout, PersonStanding } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { PredictNextBloomDateOutput } from '@/ai/flows/types';
import type { NdviDataOutput } from '@/ai/flows/get-ndvi-data';
import { Combobox } from '@/components/ui/combobox';
import { useUser } from '@/firebase';


type InsightsViewProps = {
    geodata: Country[];
    allCountries: Country[];
};

const chartConfig: ChartConfig = {
  value: {
    label: 'Vegetation Proxy (Insolation)',
    color: 'hsl(var(--primary))',
  },
};

export function InsightsView({ geodata, allCountries: extraCountries }: InsightsViewProps) {
  const { user } = useUser();
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  const [selectedCountryName, setSelectedCountryName] = useState<string>('');
  const [selectedStateName, setSelectedStateName] = useState<string>('');
  const [selectedCityName, setSelectedCityName] = useState<string>('');
  const [info, setInfo] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<PredictNextBloomDateOutput | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isAnalysisPending, startAnalysisTransition] = useTransition();

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
    setAnalysis(null);
    setAnalysisError(null);
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
      setAnalysis(null);
      setVegetationError(null);
      setAnalysisError(null);
      return
    };

    startVegetationTransition(async () => {
        setVegetationData(null);
        setAnalysis(null);
        setVegetationError(null);
        setAnalysisError(null);

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
  

  const handleGenerateAnalysis = () => {
    if (!representativeLocation || !vegetationData) return;

    startAnalysisTransition(async () => {
        setAnalysis(null);
        setAnalysisError(null);
        
        const result = await getBloomAnalysis(
            representativeLocation,
            selectedState,
            selectedCountry,
            vegetationData,
            user?.uid
        );

        if (result.success) {
            setAnalysis(result.data);
        } else {
            setAnalysisError(result.error);
        }
    });
  }
  
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
          <CardDescription>Choose a location to analyze its vegetation data and generate an AI-powered bloom analysis.</CardDescription>
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
        <Card>
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
                    <div className="space-y-6">
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
                        
                        <div className="space-y-4">
                            <Button onClick={handleGenerateAnalysis} disabled={isAnalysisPending || isVegetationPending || !vegetationData} className="w-full">
                                {isAnalysisPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                Analyze Bloom Cycle
                            </Button>
                            {isAnalysisPending && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    Generating analysis...
                                </div>
                            )}
                            {analysisError && !isAnalysisPending && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Analysis Failed</AlertTitle>
                                    <AlertDescription>{analysisError}</AlertDescription>
                                </Alert>
                            )}
                             {analysis && !isAnalysisPending && (
                                <Card className="shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                                        <Flower className="h-6 w-6"/> AI Botanical Analysis
                                        </CardTitle>
                                        <CardDescription>{analysis.predictionJustification}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <h3 className="font-semibold flex items-center gap-2"><Sprout className="text-accent"/>Suitable Flower Species</h3>
                                            <p className="text-muted-foreground text-sm">{analysis.potentialSpecies}</p>

                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-semibold flex items-center gap-2"><Flower className="text-accent"/>Ecological Significance</h3>
                                            <p className="text-muted-foreground text-sm">{analysis.ecologicalSignificance}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-semibold flex items-center gap-2"><PersonStanding className="text-accent"/>Human Impact</h3>
                                            <p className="text-muted-foreground text-sm">{analysis.humanImpact}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
