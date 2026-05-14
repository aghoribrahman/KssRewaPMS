import { useState } from 'react';
import { Search, Check } from 'lucide-react';
import { MADHYA_PRADESH_DISTRICTS } from '../../constants/mp_data';
import { cn } from '@/lib/utils';

interface DistrictListProps {
  selectedDistricts: string[];
  onToggle: (district: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  t: any; // Translation object
  className?: string;
  itemClassName?: string;
}

export function DistrictList({ 
  selectedDistricts, 
  onToggle, 
  onSelectAll, 
  onClearAll, 
  t,
  className,
  itemClassName
}: DistrictListProps) {
  const [search, setSearch] = useState('');

  const filteredDistricts = MADHYA_PRADESH_DISTRICTS.filter(d => 
    d.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input 
            type="text"
            placeholder={t.searchDistricts || "Search district..."}
            className="w-full bg-white border border-neutral-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-neutral-100">
        <button 
          onClick={onSelectAll} 
          className="text-[10px] font-bold text-primary hover:underline"
        >
          Select All
        </button>
        <button 
          onClick={onClearAll} 
          className="text-[10px] font-bold text-neutral-500 hover:underline"
        >
          Clear All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {filteredDistricts.length > 0 ? (
          filteredDistricts.map(district => {
            const isSelected = selectedDistricts.includes(district);
            return (
              <button
                key={district}
                onClick={() => onToggle(district)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-all font-medium mb-0.5",
                  isSelected 
                    ? 'bg-primary/5 text-primary' 
                    : 'text-neutral-700 hover:bg-neutral-50',
                  itemClassName
                )}
              >
                {district}
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary" />
                )}
              </button>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <p className="text-xs text-neutral-400 italic">No districts found</p>
          </div>
        )}
      </div>
    </div>
  );
}
