
'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, MapPin, ArrowLeft, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Country, State, City } from '@/lib/geodata';

type MapSearchProps = {
  viewLevel: 'country' | 'state' | 'city';
  countries: Country[];
  states: State[];
  cities: City[];
  loadingStates: boolean;
  loadingCities: boolean;
  selectedCountry: Country | null;
  selectedState: State | null;
  onSelectCountry: (country: Country) => void;
  onSelectState: (state: State) => void;
  onSelectCity: (city: City) => void;
  onBackToCountries: () => void;
  onBackToStates: () => void;
};

export function MapSearch({
  viewLevel,
  countries,
  states,
  cities,
  loadingStates,
  loadingCities,
  selectedCountry,
  selectedState,
  onSelectCountry,
  onSelectState,
  onSelectCity,
  onBackToCountries,
  onBackToStates,
}: MapSearchProps) {
  const [open, setOpen] = React.useState(false);

  const placeholderText = {
    country: 'Search for a country...',
    state: `Search states in ${selectedCountry?.name}...`,
    city: `Search cities in ${selectedState?.name}...`,
  }[viewLevel];

  const renderContent = () => {
    if (viewLevel === 'country') {
      return (
        <CommandGroup heading="Countries">
          {countries.map((country) => (
            <CommandItem
              key={country.name}
              value={country.name}
              onSelect={() => {
                onSelectCountry(country);
                setOpen(false);
              }}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {country.name}
            </CommandItem>
          ))}
        </CommandGroup>
      );
    }
    if (viewLevel === 'state' && selectedCountry) {
      return (
        <>
          <Button variant="ghost" size="sm" onClick={() => { onBackToCountries(); setOpen(false); }} className="mb-2 w-full justify-start">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Countries
          </Button>
          <CommandGroup heading={`States in ${selectedCountry.name}`}>
            {loadingStates ? (
                <div className="flex items-center justify-center p-4 text-sm">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Loading states...
                </div>
            ) : states.length > 0 ? (
                states.map((state) => (
                    <CommandItem
                        key={state.name}
                        value={state.name}
                        onSelect={() => {
                        onSelectState(state);
                        setOpen(false);
                        }}
                    >
                        <MapPin className="mr-2 h-4 w-4" />
                        {state.name}
                    </CommandItem>
                    ))
            ) : <CommandEmpty>We're still gathering data for this country's states. Please check back later!</CommandEmpty>}
          </CommandGroup>
        </>
      );
    }
    if (viewLevel === 'city' && selectedState) {
      return (
        <>
          <Button variant="ghost" size="sm" onClick={() => { onBackToStates(); setOpen(false); }} className="mb-2 w-full justify-start">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to States
          </Button>
          <CommandGroup heading={`Cities in ${selectedState.name}`}>
          {loadingCities ? (
                <div className="flex items-center justify-center p-4 text-sm">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Loading cities...
                </div>
            ) : cities.length > 0 ? (
                cities.map((city) => (
              <CommandItem
                key={city.name}
                value={city.name}
                onSelect={() => {
                  onSelectCity(city);
                  setOpen(false);
                }}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {city.name}
              </CommandItem>
            ))) : <CommandEmpty>No cities found for this state.</CommandEmpty>}
          </CommandGroup>
        </>
      );
    }
    return <CommandEmpty>No results found.</CommandEmpty>;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background/80 hover:bg-background"
        >
          {placeholderText}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            {renderContent()}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
