import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { countryCodes } from "@/lib/country-codes";

interface CountryCodeSelectProps {
  value: string;
  onChange: (iso2: string) => void;
}

export const CountryCodeSelect = ({ value, onChange }: CountryCodeSelectProps) => {
  const [open, setOpen] = useState(false);
  const selected = countryCodes.find((c) => c.iso2 === value) ?? countryCodes[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[110px] shrink-0 justify-between px-2 font-normal"
        >
          <span className="flex items-center gap-1.5 truncate">
            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground bg-muted rounded px-1 py-0.5">
              {selected.iso2}
            </span>
            <span>{selected.dialCode}</span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command
          filter={(itemValue, search) => {
            const country = countryCodes.find((c) => c.iso2 === itemValue);
            if (!country) return 0;
            const haystack = `${country.name} ${country.dialCode}`.toLowerCase();
            return haystack.includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Buscar país..." />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {countryCodes.map((country) => (
                <CommandItem
                  key={country.iso2}
                  value={country.iso2}
                  onSelect={() => {
                    onChange(country.iso2);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === country.iso2 ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-[10px] font-semibold tracking-wide text-muted-foreground bg-muted rounded px-1 py-0.5 mr-2">
                    {country.iso2}
                  </span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-muted-foreground">{country.dialCode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
