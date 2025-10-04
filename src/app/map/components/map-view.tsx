
'use client';

import { APIProvider, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { RegionMarker } from './region-marker';
import { MapSearch } from './map-search';
import { fetchCountries, fetchStates, fetchCities, type Country, type State, type City } from '@/lib/geo-api';
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
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Selection states
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Loading states
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getCountries() {
      try {
        setError(null);
        setLoadingCountries(true);
        const fetchedCountries = await fetchCountries();
        setCountries(fetchedCountries);
      } catch (err) {
        setError("Failed to fetch country data. The API may be down or your API key is invalid.");
        console.error(err);
      } finally {
        setLoadingCountries(false);
      }
    }
    getCountries();
  }, []);

  const handleMapChange = (e: MapCameraChangedEvent) => {
    const { center, zoom } = e.detail;
    setCameraState({ center, zoom });
  };

  const handleSelectCountry = useCallback(async (country: Country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    setStates([]);
    setCities([]);
    setViewLevel('state');
    setCameraState({ center: { lat: country.latitude, lng: country.longitude }, zoom: 5 });

    try {
      setError(null);
      setLoadingStates(true);
      const fetchedStates = await fetchStates(country.iso2);
      setStates(fetchedStates);
    } catch (err) {
      setError(`Failed to fetch states for ${country.name}.`);
      console.error(err);
    } finally {
      setLoadingStates(false);
    }
  }, []);

  const handleSelectState = useCallback(async (state: State) => {
    if (!selectedCountry) return;
    setSelectedState(state);
    setSelectedCity(null);
    setCities([]);
    setViewLevel('city');
    setCameraState({ center: { lat: state.latitude, lng: state.longitude }, zoom: 8 });

    try {
        setError(null);
        setLoadingCities(true);
        const fetchedCities = await fetchCities(selectedCountry.iso2, state.iso2);
        setCities(fetchedCities);
    } catch(err) {
        setError(`Failed to fetch cities for ${state.name}.`);
        console.error(err);
    } finally {
        setLoadingCities(false);
    }
  }, [selectedCountry]);

  const handleSelectCity = useCallback((city: City) => {
    setSelectedCity(city);
    setCameraState({ center: { lat: city.latitude, lng: city.longitude }, zoom: 12 });
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
    setCameraState({ center: { lat: selectedCountry.latitude, lng: selectedCountry.longitude }, zoom: 5 });
  };
  
  const markersToDisplay = useMemo(() => {
    if (viewLevel === 'city') return cities.map(c => ({...c, type: 'city', lat: c.latitude, lon: c.longitude}));
    if (viewLevel === 'state') return states.map(s => ({...s, type: 'state', lat: s.latitude, lon: s.longitude}));
    return countries.map(c => ({...c, type: 'country', lat: c.latitude, lon: c.longitude}));
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
            key={item.id || item.iso2}
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
          loadingStates={loadingStates}
          loadingCities={loadingCities}
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
