
'use client';

import { APIProvider, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { useState, useCallback, useMemo } from 'react';
import { RegionMarker } from './region-marker';
import { MapSearch } from './map-search';
import { geoData, Country, State, City } from '@/lib/geodata';

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
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const handleMapChange = (e: MapCameraChangedEvent) => {
    const { center, zoom } = e.detail;
    setCameraState({ center, zoom });
  };

  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    setViewLevel('state');
    setCameraState({ center: { lat: country.lat, lng: country.lon }, zoom: 5 });
  };

  const handleSelectState = (state: State) => {
    setSelectedState(state);
    setSelectedCity(null);
    setViewLevel('city');
    setCameraState({ center: { lat: state.lat, lng: state.lon }, zoom: 8 });
  };

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setCameraState({ center: { lat: city.lat, lng: city.lon }, zoom: 12 });
  };
  
  const handleBackToCountries = () => {
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    setViewLevel('country');
    setCameraState(INITIAL_CAMERA);
  };
  
  const handleBackToStates = () => {
    if(!selectedCountry) return;
    setSelectedState(null);
    setSelectedCity(null);
    setViewLevel('state');
    setCameraState({ center: { lat: selectedCountry.lat, lng: selectedCountry.lon }, zoom: 5 });
  };

  const markersToDisplay = useMemo(() => {
    if (viewLevel === 'country') {
      return geoData.map(country => ({ ...country, type: 'country' as const }));
    }
    if (viewLevel === 'state' && selectedCountry) {
      return selectedCountry.states.map(state => ({ ...state, type: 'state' as const }));
    }
    if (viewLevel === 'city' && selectedState) {
      return selectedState.cities.map(city => ({ ...city, type: 'city' as const }));
    }
    return [];
  }, [viewLevel, selectedCountry, selectedState]);

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
        {markersToDisplay.map((item) => (
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
            countries={geoData}
            selectedCountry={selectedCountry}
            selectedState={selectedState}
            onSelectCountry={handleSelectCountry}
            onSelectState={handleSelectState}
            onSelectCity={handleSelectCity}
            onBackToCountries={handleBackToCountries}
            onBackToStates={handleBackToStates}
        />
      </div>
    </APIProvider>
  );
}
