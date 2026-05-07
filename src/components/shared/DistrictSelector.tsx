import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { buttonVariants } from '../ui/button';
import { MapPin, Check } from 'lucide-react';
import { Badge } from '../ui/badge';
import { MADHYA_PRADESH_DISTRICTS } from '../../constants/mp_data';
import { cn } from '@/lib/utils';

interface DistrictSelectorProps {
  selectedDistricts: string[];
  onToggle: (district: string) => void;
  className?: string;
  maxDisplay?: number;
}

export function DistrictSelector({ selectedDistricts, onToggle, className, maxDisplay = 5 }: DistrictSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Popover>
        <PopoverTrigger className={buttonVariants({ variant: 'outline', className: "w-full h-12 rounded-xl justify-between px-4 border" })}>
          <span className="text-neutral-500 font-normal">
            {selectedDistricts.length === 0 
              ? "Selecting Districts..." 
              : `${selectedDistricts.length} Districts Selected`}
          </span>
          <MapPin className="w-4 h-4 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 rounded-2xl shadow-2xl border-neutral-100" align="start">
          <div className="p-3 border-b bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none">
            Madhya Pradesh Districts
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {MADHYA_PRADESH_DISTRICTS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => onToggle(d)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between hover:bg-neutral-50 font-medium"
              >
                {d}
                {selectedDistricts.includes(d) && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <div className="flex flex-wrap gap-1 mt-2">
        {selectedDistricts.slice(0, maxDisplay).map(d => (
          <Badge key={d} variant="secondary" className="rounded-full font-normal bg-neutral-100">{d}</Badge>
        ))}
        {selectedDistricts.length > maxDisplay && (
          <Badge variant="secondary" className="rounded-full font-normal">
            +{selectedDistricts.length - maxDisplay} more
          </Badge>
        )}
      </div>
    </div>
  );
}
