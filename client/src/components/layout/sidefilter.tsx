import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CITIES_AND_NEIGHBORHOODS, NEIGHBORHOODS } from "@shared/schema";
import { ChevronDown, ChevronRight } from "lucide-react";

const MULTI_OPTIONS = ["yes", "no", "not mentioned"];

function translateOption(option: string) {
  if (option === "yes") return "כן";
  if (option === "no") return "לא";
  if (option === "not mentioned") return "לא צויין";
  return option;
}

interface FilterSidebarProps {
  onChange: (filters: FilterState) => void;
  initialFilters: Partial<FilterState>;
}

interface FilterState {
  minPrice: number;
  maxPrice: number;
  minSize: number;
  maxSize: number;
  minRooms: number;
  maxRooms: number;
  neighborhoods: string[];
  balcony: string[];
  parking: string[];
  furnished: string[];
  agent: string[];
  includeZeroPrice: boolean;
  includeZeroSize: boolean;
  includeZeroRooms: boolean;
}

function FilterSidebar({ onChange, initialFilters }: FilterSidebarProps) {
  // Default multi-choice fields are set to all options checked.
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 10000,
    minSize: 0,
    maxSize: 500,
    minRooms: 0,
    maxRooms: 10,
    neighborhoods: [] as string[],
    balcony: [...MULTI_OPTIONS] as string[],
    parking: [...MULTI_OPTIONS] as string[],
    furnished: [...MULTI_OPTIONS] as string[],
    agent: [...MULTI_OPTIONS] as string[],
    // New fields: include listings with 0 value?
    includeZeroPrice:
      initialFilters.includeZeroPrice !== undefined
        ? initialFilters.includeZeroPrice
        : true,
    includeZeroSize:
      initialFilters.includeZeroSize !== undefined
        ? initialFilters.includeZeroSize
        : true,
    includeZeroRooms:
      initialFilters.includeZeroRooms !== undefined
        ? initialFilters.includeZeroRooms
        : true,
    ...initialFilters,
  });

  // Track which cities are expanded in the UI
  const [expandedCities, setExpandedCities] = useState<string[]>([]);
  // Track which cities are associated with selected neighborhoods
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  // Errors state for multi-choice fields.
  const [errors, setErrors] = useState({
    balcony: "",
    parking: "",
    furnished: "",
    agent: "",
  });

  // Initialize cities based on selected neighborhoods
  useEffect(() => {
    if (filters.neighborhoods.length > 0) {
      const cities = Object.keys(CITIES_AND_NEIGHBORHOODS);
      const selectedCitiesList = cities.filter(city => 
        CITIES_AND_NEIGHBORHOODS[city as keyof typeof CITIES_AND_NEIGHBORHOODS].some(n => 
          filters.neighborhoods.includes(n)
        )
      );
      setSelectedCities(selectedCitiesList);
      setExpandedCities(selectedCitiesList);
    }
  }, []);

  // Propagate filter changes to parent.
  useEffect(() => {
    onChange(filters);
  }, [filters, onChange]);

  const updateNumericFilter = (field: keyof FilterState, value: number) => {
    setFilters((f) => ({ ...f, [field]: value }));
  };

  const toggleNeighborhood = (n: string) => {
    setFilters((f) => ({
      ...f,
      neighborhoods: f.neighborhoods.includes(n)
        ? f.neighborhoods.filter((x) => x !== n)
        : [...f.neighborhoods, n],
    }));
  };

  // Toggle expand/collapse city in the UI
  const toggleExpandCity = (city: string) => {
    setExpandedCities(current => 
      current.includes(city) 
        ? current.filter(c => c !== city) 
        : [...current, city]
    );
  };

  // Select all neighborhoods for a city
  const selectAllNeighborhoods = (city: string, e?: React.SyntheticEvent) => {
    // Stop event propagation to prevent toggling the dropdown (if event is provided)
    if (e) {
      e.stopPropagation();
    }
    
    const cityNeighborhoods = CITIES_AND_NEIGHBORHOODS[city as keyof typeof CITIES_AND_NEIGHBORHOODS];
    
    setFilters(f => {
      // Get all currently selected neighborhoods that are not from this city
      const otherNeighborhoods = f.neighborhoods.filter(n => !cityNeighborhoods.includes(n));
      
      // If all neighborhoods of the city are already selected, deselect them all
      const allSelected = cityNeighborhoods.every(n => f.neighborhoods.includes(n));
      
      if (allSelected) {
        return { ...f, neighborhoods: otherNeighborhoods };
      } else {
        // Otherwise, select all neighborhoods from the city
        return { ...f, neighborhoods: [...otherNeighborhoods, ...cityNeighborhoods] };
      }
    });
  };

  // Toggle a multi-choice option for a given field.
  const toggleOption = (
    field: "balcony" | "parking" | "furnished" | "agent",
    option: string,
  ) => {
    setFilters((f) => {
      const current = f[field];
      let updated = [...current];
      if (current.includes(option)) {
        // User is trying to uncheck this option.
        if (current.length === 1) {
          // Cannot uncheck the last option.
          setErrors((prev) => ({
            ...prev,
            [field]: "צריך לבחור לפחות אופציה אחת על מנת לקבל תוצאות",
          }));
          return f;
        } else {
          updated = current.filter((x) => x !== option);
          setErrors((prev) => ({ ...prev, [field]: "" }));
        }
      } else {
        // Toggling the option on.
        updated.push(option);
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
      return { ...f, [field]: updated };
    });
  };

  // Render function for multi-choice fields as a group of checkboxes.
  const renderMultiChoiceField = (
    label: string,
    field: "balcony" | "parking" | "furnished" | "agent",
    current: string[],
    toggleFn: (option: string) => void,
    error: string,
  ) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium">{label}</label>
        <div className="flex items-center gap-4 mt-1">
          {MULTI_OPTIONS.map((option) => (
            <div key={`${field}-${option}`} className="flex items-center gap-1">
              <Checkbox
                id={`${field}-${option}`}
                className="accent-primary"
                checked={current.includes(option)}
                onCheckedChange={() => toggleFn(option)}
              />
              <label htmlFor={`${field}-${option}`} className="text-sm">
                {translateOption(option)}
              </label>
            </div>
          ))}
        </div>
        {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      </div>
    );
  };

  return (
    <div className="space-y-4 p-4 border-l-2">
      {/* Price Range */}
      <div>
        <label className="text-sm font-medium">טווח מחירים</label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            type="number"
            placeholder="מינימום"
            value={filters.minPrice}
            onChange={(e) =>
              updateNumericFilter("minPrice", Number(e.target.value))
            }
          />
          <span>-</span>
          <Input
            type="number"
            placeholder="מקסימום"
            value={filters.maxPrice}
            onChange={(e) =>
              updateNumericFilter("maxPrice", Number(e.target.value))
            }
          />
        </div>
        {/* New checkbox for including listings with 0 price */}
        <label className="flex items-center gap-1 mt-1">
          <input
            type="checkbox"
            className="accent-primary"
            checked={filters.includeZeroPrice}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                includeZeroPrice: e.target.checked,
              }))
            }
          />
          <span className="text-sm">תראו לי גם דירות ללא מחיר</span>
        </label>
      </div>

      {/* Size Range */}
      <div>
        <label className="text-sm font-medium">גודל (מ"ר)</label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            type="number"
            placeholder="מינימום"
            value={filters.minSize}
            onChange={(e) =>
              updateNumericFilter("minSize", Number(e.target.value))
            }
          />
          <span>-</span>
          <Input
            type="number"
            placeholder="מקסימום"
            value={filters.maxSize}
            onChange={(e) =>
              updateNumericFilter("maxSize", Number(e.target.value))
            }
          />
        </div>
        {/* New checkbox for including listings with 0 size */}
        <label className="flex items-center gap-1 mt-1">
          <input
            type="checkbox"
            className="accent-primary"
            checked={filters.includeZeroSize}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                includeZeroSize: e.target.checked,
              }))
            }
          />
          <span className="text-sm">תראו לי גם דירות ללא גודל</span>
        </label>
      </div>

      {/* Rooms */}
      <div>
        <label className="text-sm font-medium">חדרים</label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            type="number"
            placeholder="מינימום"
            value={filters.minRooms}
            onChange={(e) =>
              updateNumericFilter("minRooms", Number(e.target.value))
            }
          />
          <span>-</span>
          <Input
            type="number"
            placeholder="מקסימום"
            value={filters.maxRooms}
            onChange={(e) =>
              updateNumericFilter("maxRooms", Number(e.target.value))
            }
          />
        </div>
        {/* New checkbox for including listings with 0 rooms */}
        <label className="flex items-center gap-1 mt-1">
          <input
            type="checkbox"
            className="accent-primary"
            checked={filters.includeZeroRooms}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                includeZeroRooms: e.target.checked,
              }))
            }
          />
          <span className="text-sm">תראו לי גם דירות ללא מספר חדרים</span>
        </label>
      </div>

      {/* Cities and Neighborhoods as dropdown */}
      <div>
        <label className="text-sm font-medium">ערים ושכונות</label>
        <div className="border rounded-md mt-1">
          {Object.keys(CITIES_AND_NEIGHBORHOODS).map((city) => {
            const cityNeighborhoods = CITIES_AND_NEIGHBORHOODS[city as keyof typeof CITIES_AND_NEIGHBORHOODS];
            const isExpanded = expandedCities.includes(city);
            const allNeighborhoodsSelected = cityNeighborhoods.every(n => filters.neighborhoods.includes(n));
            const someNeighborhoodsSelected = cityNeighborhoods.some(n => filters.neighborhoods.includes(n)) && !allNeighborhoodsSelected;
            
            return (
              <div key={city} className="border-b last:border-b-0">
                {/* City header - clicking it toggles expansion */}
                <div 
                  className="flex items-center p-2 cursor-pointer hover:bg-gray-50" 
                  onClick={() => toggleExpandCity(city)}
                >
                  <div className="mr-2 p-1">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-grow">
                    {/* The checkbox only selects neighborhoods and prevents propagation */}
                    <Checkbox
                      className="accent-primary"
                      checked={allNeighborhoodsSelected}
                      ref={(el: any) => {
                        if (el?.input) {
                          // Use indeterminate state for partially selected cities
                          el.input.indeterminate = someNeighborhoodsSelected;
                        }
                      }}
                      onCheckedChange={() => selectAllNeighborhoods(city)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm font-medium">{city}</span>
                  </div>
                </div>
                
                {/* Neighborhood list - shown when expanded */}
                {isExpanded && (
                  <div className="pl-8 pr-2 py-1 border-t bg-gray-50">
                    <div className="grid grid-cols-2 gap-2 pb-1">
                      {cityNeighborhoods.map((n) => (
                        <div key={n} className="flex items-center gap-1">
                          <Checkbox
                            id={n}
                            className="accent-primary"
                            checked={filters.neighborhoods.includes(n)}
                            onCheckedChange={() => toggleNeighborhood(n)}
                          />
                          <label htmlFor={n} className="text-sm">{n}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-choice Fields as Checkboxes */}
      <div className="border-t-2 pt-3">
        <label className="text-sm font-medium">מרפסת</label>
        <div className="flex items-center gap-4 mt-1">
          {MULTI_OPTIONS.map((option) => (
            <div key={`balcony-${option}`} className="flex items-center gap-1">
              <Checkbox
                id={`balcony-${option}`}
                className="accent-primary"
                checked={filters.balcony.includes(option)}
                onCheckedChange={() => toggleOption("balcony", option)}
              />
              <label htmlFor={`balcony-${option}`} className="text-sm">
                {translateOption(option)}
              </label>
            </div>
          ))}
        </div>
        {errors.balcony && (
          <div className="text-red-500 text-sm mt-1">{errors.balcony}</div>
        )}
      </div>

      <div className="border-t-2 pt-3">
        <label className="text-sm font-medium">חניה</label>
        <div className="flex items-center gap-4 mt-1">
          {MULTI_OPTIONS.map((option) => (
            <div key={`parking-${option}`} className="flex items-center gap-1">
              <Checkbox
                id={`parking-${option}`}
                className="accent-primary"
                checked={filters.parking.includes(option)}
                onCheckedChange={() => toggleOption("parking", option)}
              />
              <label htmlFor={`parking-${option}`} className="text-sm">
                {translateOption(option)}
              </label>
            </div>
          ))}
        </div>
        {errors.parking && (
          <div className="text-red-500 text-sm mt-1">{errors.parking}</div>
        )}
      </div>

      <div className="border-t-2 pt-3">
        <label className="text-sm font-medium">מרוהט</label>
        <div className="flex items-center gap-4 mt-1 ">
          {MULTI_OPTIONS.map((option) => (
            <div
              key={`furnished-${option}`}
              className="flex items-center gap-1"
            >
              <Checkbox
                id={`furnished-${option}`}
                className="accent-primary"
                checked={filters.furnished.includes(option)}
                onCheckedChange={() => toggleOption("furnished", option)}
              />
              <label htmlFor={`furnished-${option}`} className="text-sm">
                {translateOption(option)}
              </label>
            </div>
          ))}
        </div>
        {errors.furnished && (
          <div className="text-red-500 text-sm mt-1">{errors.furnished}</div>
        )}
      </div>

      <div className="border-t-2 pt-3">
        <label className="text-sm font-medium">תיווך</label>
        <div className="flex items-center gap-4 mt-1 ">
          {MULTI_OPTIONS.map((option) => (
            <div key={`agent-${option}`} className="flex items-center gap-1">
              <Checkbox
                id={`agent-${option}`}
                className="accent-primary"
                checked={filters.agent.includes(option)}
                onCheckedChange={() => toggleOption("agent", option)}
              />
              <label htmlFor={`agent-${option}`} className="text-sm">
                {translateOption(option)}
              </label>
            </div>
          ))}
        </div>
        {errors.agent && (
          <div className="text-red-500 text-sm mt-1">{errors.agent}</div>
        )}
      </div>
    </div>
  );
}

export default FilterSidebar;
