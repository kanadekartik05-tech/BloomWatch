
'use client';

import { APIProvider, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { useState, useCallback, useMemo } from 'react';
import { RegionMarker } from './region-marker';
import { MapSearch } from './map-search';
import { geodata, type Country, type State, type City } from '@/lib/geodata';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type MapViewProps = {
  apiKey: string;
};

type ViewLevel = 'country' | 'state' | 'city';

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

  const [error, setError] = useState<string | null>(null);

  const handleMapChange = (e: MapCameraChangedEvent) => {
    const { center, zoom } = e.detail;
    setCameraState({ center, zoom });
  };

  const handleSelectCountry = useCallback((country: Country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    setStates(country.states || []);
    setCities([]);
    setViewLevel('state');
    setCameraState({ center: { lat: country.lat, lng: country.lon }, zoom: 5 });
  }, []);

  const handleSelectState = useCallback((state: State) => {
    if (!selectedCountry) return;
    setSelectedState(state);
    setSelectedCity(null);
    setCities(state.cities || []);
    setViewLevel('city');
    setCameraState({ center: { lat: state.lat, lng: state.lon }, zoom: 8 });
  }, [selectedCountry]);

  const handleSelectCity = useCallback((city: City) => {
    setSelectedCity(city);
    setCameraState({ center: { lat: city.lat, lng: city.lon }, zoom: 12 });
  }, []);

  const handleBackToCountries = () => {
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    setStates([]);
    setCities([]);
    setViewLevel('country');
    setCameraState(INITIAL_CAMERA);
  };

  const handleBackToStates = () => {
    if (!selectedCountry) return;
    setSelectedState(null);
    setSelectedCity(null);
    setCities([]);
    setViewLevel('state');
    setCameraState({ center: { lat: selectedCountry.lat, lng: selectedCountry.lon }, zoom: 5 });
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
       setSelectedCity(item);
    }
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
            isSelected={selectedCity?.name === item.name}
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
