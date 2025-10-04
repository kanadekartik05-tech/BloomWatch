
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
import { fetchClimateDataForRegion, fetchVegetationDataForRegion, getChartSummary } from '../actions';
import { Loader, Info, CalendarIcon, MessageSquareText, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ClimateDataOutput, ChartDataSummaryInput } from '@/ai/flows/types';
import type { NdviDataOutput } from '@/ai/flows/get-ndvi-data';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
  const [vegetationData, setVegetationData] = useState<NdviDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [isSummaryPending, startSummaryTransition] = useTransition();
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);


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
    setVegetationData(null);
    setSummary(null);
    setSummaryError(null);
    
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
  
  const fetchData = useCallback(() => {
    if (!representativeLocation) {
        setClimateData(null);
        setVegetationData(null);
        setError(null);
        setSummary(null);
        setSummaryError(null);
        return;
    };
    
    startTransition(async () => {
        setError(null);
        setClimateData(null);
        setVegetationData(null);
        setSummary(null);
        setSummaryError(null);

        const start = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
        const end = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;

        const input = {
            lat: representativeLocation.lat,
            lon: representativeLocation.lon,
            startDate: start,
            endDate: end,
        };

        const [climateResult, vegetationResult] = await Promise.all([
          fetchClimateDataForRegion(input),
          fetchVegetationDataForRegion(input)
        ]);

        if (climateResult.success) {
            setClimateData(climateResult.data);
        } else {
            setError(climateResult.error);
        }
        
        if (vegetationResult.success) {
            setVegetationData(vegetationResult.data);
        } else {
            // We can show the climate data even if vegetation data fails
            console.warn(vegetationResult.error);
        }
    });
  }, [representativeLocation, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleGenerateSummary = () => {
    if (!representativeLocation || !climateData || !vegetationData) return;

    startSummaryTransition(async () => {
        setSummary(null);
        setSummaryError(null);
        
        const summaryInput: ChartDataSummaryInput = {
            locationName: representativeLocation.name,
            climateData,
            vegetationData,
        };
        
        const result = await getChartSummary(summaryInput);

        if (result.success) {
            setSummary(result.data.summary);
        } else {
            setSummaryError(result.error);
        }
    });
  }

  const cardTitle = useMemo(() => {
    if (selectedCity) return `Climate Data for ${selectedCity.name}`;
    if (selectedState) return `Climate Data for ${selectedState.name}`;
    return "Climate Data";
  }, [selectedCity, selectedState]);

  const cardDescription = useMemo(() => {
    if (selectedCity) return "Monthly average temperature and rainfall.";
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
                 <div className="space-y-4 rounded-lg border p-4 mb-6">
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
                    <Button onClick={fetchData} disabled={isPending || !representativeLocation} className="w-full">
                        {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Fetch Data
                    </Button>
                </div>
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
                    <div className="space-y-6">
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

                        <div className="space-y-4">
                            <Button onClick={handleGenerateSummary} disabled={isSummaryPending || isPending || !climateData || !vegetationData} className="w-full">
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
                    </div>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
