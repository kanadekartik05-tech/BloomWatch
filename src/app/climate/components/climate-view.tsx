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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, ComposedChart } from 'recharts';
import { fetchClimateDataForRegion } from '../actions';
import { Loader, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ClimateDataOutput } from '@/ai/flows/types';
import { Combobox } from '@/components/ui/combobox';

type ClimateViewProps = {
  geodata: Country[];
  allCountries: Country[];
};

const chartConfig: ChartConfig = {
  rainfall: {
    label: 'Rainfall (mm)',
    color: 'hsl(var(--chart-1))',
  },
  temperature: {
    label: 'Temp. (°C)',
    color: 'hsl(var(--chart-2))',
  },
};

export function ClimateView({ geodata, allCountries: extraCountries }: ClimateViewProps) {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  
  const [selectedCountryName, setSelectedCountryName] = useState<string>('');
  const [selectedStateName, setSelectedStateName] = useState<string>('');
  const [selectedCityName, setSelectedCityName] = useState<string>('');
  const [info, setInfo] = useState<string | null>(null);

  const [climateData, setClimateData] = useState<ClimateDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
    setError(null);
    setInfo(null);
    setClimateData(null);
    
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
        setClimateData(null);
        setError(null);
        return;
    };
    
    startTransition(async () => {
        setError(null);
        setClimateData(null);
        const result = await fetchClimateDataForRegion({
            lat: representativeLocation.lat,
            lon: representativeLocation.lon,
        });

        if (result.success) {
            setClimateData(result.data);
        } else {
            setError(result.error);
        }
    });
  }, [representativeLocation]);

  const cardTitle = useMemo(() => {
    if (selectedCity) return `Climate Data for ${selectedCity.name}`;
    if (selectedState) return `Climate Data for ${selectedState.name}`;
    return "Climate Data";
  }, [selectedCity, selectedState]);

  const cardDescription = useMemo(() => {
    if (selectedCity) return "Monthly average temperature and rainfall over the last year.";
    if (selectedState) return `Using data from a representative city in ${selectedState.name}.`;
    return "Select a location to see its climate data.";
  }, [selectedCity, selectedState]);


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Location Selection</CardTitle>
          <CardDescription>Choose a location to see its climate data.</CardDescription>
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
                {isPending && (
                    <div className="flex h-72 w-full items-center justify-center text-muted-foreground">
                        <Loader className="mr-2 h-6 w-6 animate-spin" />
                        Fetching NASA climate data...
                    </div>
                )}
                {error && !isPending && (
                    <Alert variant="destructive">
                        <AlertTitle>Failed to Fetch Data</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {climateData && !isPending && !error && (
                    <ChartContainer config={chartConfig} className="h-72 w-full">
                        <ComposedChart data={climateData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis yAxisId="left" orientation="left" stroke="var(--color-rainfall)" tickLine={false} axisLine={false} label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }}/>
                            <YAxis yAxisId="right" orientation="right" stroke="var(--color-temperature)" tickLine={false} axisLine={false} label={{ value: 'Temperature (°C)', angle: 90, position: 'insideRight' }}/>
                            <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar dataKey="rainfall" fill="var(--color-rainfall)" radius={4} yAxisId="left"/>
                            <Line type="monotone" dataKey="temperature" stroke="var(--color-temperature)" strokeWidth={2} yAxisId="right" />
                        </ComposedChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
