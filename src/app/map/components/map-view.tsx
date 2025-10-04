
'use client';

import { APIProvider, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { useState, useCallback, useMemo, useTransition } from 'react';
import { RegionMarker } from './region-marker';
import { MapSearch } from './map-search';
import { geodata, type Country, type State, type City } from '@/lib/geodata';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getBloomPredictionForCity } from '../actions';
import type { PredictNextBloomDateOutput } from '@/ai/flows/predict-next-bloom-date';


type MapViewProps = {
  apiKey: string;
};

type ViewLevel = 'country' | 'state' | 'city';
type PredictionState = PredictNextBloomDateOutput | null;

const INITIAL_CAMERA = {
  center: { lat: 20, lng: 0 },
  zoom: 2,
};

export default function MapView({ apiKey }: MapViewProps) {
  const [cameraState, setCameraState] = useState(INITIAL_CAMERA);
  const [viewLevel, setViewLevel] = useState<ViewLevel>('country');

  // Data states
  const countries = useMemo(() => geodata, []);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Selection states
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Prediction states
  const [prediction, setPrediction] = useState<PredictionState>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [isAIPending, startAITransition] = useTransition();

  const [error, setError] = useState<string | null>(null);

  const handleMapChange = (e: MapCameraChangedEvent) => {
    const { center, zoom } = e.detail;
    setCameraState({ center, zoom });
  };
  
  const resetSelection = () => {
    setSelectedCity(null);
    setPrediction(null);
    setPredictionError(null);
  }

  const handleSelectCountry = useCallback((country: Country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setStates(country.states || []);
    setCities([]);
    setViewLevel('state');
    setCameraState({ center: { lat: country.lat, lng: country.lon }, zoom: 5 });
    resetSelection();
  }, []);

  const handleSelectState = useCallback((state: State) => {
    if (!selectedCountry) return;
    setSelectedState(state);
    setCities(state.cities || []);
    setViewLevel('city');
    setCameraState({ center: { lat: state.lat, lng: state.lon }, zoom: 8 });
    resetSelection();
  }, [selectedCountry]);

  const handleSelectCity = useCallback((city: City) => {
    setSelectedCity(city);
    setCameraState({ center: { lat: city.lat, lng: city.lon }, zoom: 12 });
    setPrediction(null);
    setPredictionError(null);
    
    startAITransition(async () => {
      const result = await getBloomPredictionForCity(city);
      if (result.success) {
        setPrediction(result.data);
      } else {
        setPredictionError(result.error);
      }
    });

  }, []);

  const handleBackToCountries = () => {
    setSelectedCountry(null);
    setSelectedState(null);
    setStates([]);
    setCities([]);
    setViewLevel('country');
    setCameraState(INITIAL_CAMERA);
    resetSelection();
  };

  const handleBackToStates = () => {
    if (!selectedCountry) return;
    setSelectedState(null);
    setCities([]);
    setViewLevel('state');
    setCameraState({ center: { lat: selectedCountry.lat, lng: selectedCountry.lon }, zoom: 5 });
    resetSelection();
  };
  
  const markersToDisplay = useMemo(() => {
    if (viewLevel === 'city') return cities.map(c => ({...c, type: 'city'}));
    if (viewLevel === 'state') return states.map(s => ({...s, type: 'state'}));
    return countries.map(c => ({...c, type: 'country'}));
  }, [viewLevel, countries, states, cities]);

  const handleMarkerClick = (item: any) => {
     if (item.type === 'country') {
      handleSelectCountry(item);
    } else if (item.type === 'state') {
      handleSelectState(item);
    } else {
       handleSelectCity(item);
    }
  };

  const handleInfoWindowClose = () => {
    setSelectedCity(null);
    setPrediction(null);
    setPredictionError(null);
  };

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        {...cameraState}
        onCameraChanged={handleMapChange}
        mapId="bloomwatch_map"
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        className="h-full w-full"
      >
        {markersToDisplay.map((item: any) => (
          <RegionMarker
            key={item.name}
            item={item}
            onClick={() => handleMarkerClick(item)}
            onClose={handleInfoWindowClose}
            isSelected={selectedCity?.name === item.name}
            prediction={prediction}
            isLoading={isAIPending && selectedCity?.name === item.name}
            error={predictionError}
          />
        ))}
      </Map>

      <div className="absolute top-4 left-4 z-10 w-full max-w-sm">
        <MapSearch
          viewLevel={viewLevel}
          countries={countries}
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
        {error && <Alert variant="destructive" className="mt-2"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
      </div>
    </APIProvider>
  );
}
