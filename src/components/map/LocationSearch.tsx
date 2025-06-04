import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { searchLocation } from '../../services/geocodingService';
import type { Location } from '../../types';

interface LocationSearchProps {
  placeholder: string;
  icon: React.ReactNode;
  onSelect: (location: Location) => void;
  value: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  placeholder,
  icon,
  onSelect,
  value
}) => {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Use the passed-in value if available, otherwise use the internal input value
  const displayValue = value || inputValue;
  
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);
    
    if (query.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }
    
    setIsSearching(true);
    setShowResults(true);
    
    try {
      const locations = await searchLocation(query);
      setResults(locations);
    } catch (error) {
      console.error("Error searching for location:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectLocation = (location: Location) => {
    onSelect(location);
    setInputValue(location.name);
    setShowResults(false);
  };
  
  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setShowResults(inputValue.length >= 3)}
          onBlur={() => {
            // Delay hiding results to allow for click
            setTimeout(() => setShowResults(false), 200);
          }}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
          {icon}
        </div>
      </div>
      
      {showResults && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {isSearching ? (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
          ) : (
            <ul className="py-1">
              {results.map((location, index) => (
                <li
                  key={index}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 cursor-pointer"
                  onClick={() => handleSelectLocation(location)}
                >
                  <div className="font-medium">{location.name}</div>
                  {location.description && (
                    <div className="text-xs text-gray-500">{location.description}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;