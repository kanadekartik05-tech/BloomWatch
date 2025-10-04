'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
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
import type { Region } from '@/lib/data';

type MapSearchProps = {
  regions: Region[];
  onSelect: (region: Region) => void;
};

export function MapSearch({ regions, onSelect }: MapSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background/80 hover:bg-background"
        >
          {value
            ? regions.find((region) => region.name.toLowerCase() === value)?.name
            : 'Search for a region...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search region..." />
          <CommandList>
            <CommandEmpty>No region found.</CommandEmpty>
            <CommandGroup>
              {regions.map((region) => (
                <CommandItem
                  key={region.name}
                  value={region.name}
                  onSelect={(currentValue) => {
                    const selectedValue = currentValue.toLowerCase() === value ? '' : currentValue;
                    setValue(selectedValue);
                    const selectedRegion = regions.find(r => r.name.toLowerCase() === selectedValue);
                    if (selectedRegion) {
                        onSelect(selectedRegion);
                    }
                    setOpen(false);
                  }}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {region.name}
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === region.name.toLowerCase() ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
