import React, { useState, useEffect } from 'react';
import { Calendar, Filter, MapPin, Clock, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { fetchCrimeData } from '../services/crimeService';
import type { CrimeIncident, TimeFilter } from '../types';

const CrimeFeedPage: React.FC = () => {
  const [crimeData, setCrimeData] = useState<CrimeIncident[]>([]);
  const [filteredData, setFilteredData] = useState<CrimeIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24h');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  const itemsPerPage = 50;
  const { showToast } = useToast();

  // Get user's location for distance calculation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Fetch crime data
  useEffect(() => {
    const loadCrimeData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCrimeData(timeFilter);
        setCrimeData(data);
        setFilteredData(data);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error fetching crime data:", error);
        showToast({
          title: 'Error',
          message: 'Could not load crime data. Please try again.',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCrimeData();
  }, [timeFilter]);

  // Filter data when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(crimeData);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = crimeData.filter(
      crime => 
        crime.category.toLowerCase().includes(term) ||
        crime.address.toLowerCase().includes(term)
    );
    
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, crimeData]);

  // Calculate distance between two coordinates in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };

  // Get human-readable time difference
  const getTimeAgo = (dateTime: string): string => {
    const now = new Date();
    const incidentTime = new Date(dateTime);
    const diffMs = now.getTime() - incidentTime.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const handleFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crime Feed</h1>
        <p className="text-gray-600">
          Stay informed about recent incidents in your area
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleFilterChange('24h')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  timeFilter === '24h' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 24h
              </button>
              <button
                onClick={() => handleFilterChange('48h')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  timeFilter === '48h' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 48h
              </button>
              <button
                onClick={() => handleFilterChange('72h')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  timeFilter === '72h' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 72h
              </button>
              <button
                onClick={() => handleFilterChange('week')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  timeFilter === 'week' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last Week
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by category or location..."
                className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <Filter size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No incidents found</h3>
              <p className="text-gray-500 mt-2">
                {searchTerm 
                  ? "Try adjusting your search term" 
                  : "No crime incidents reported in the selected time period"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      {userLocation && (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Distance
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((crime, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock size={16} className="text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(crime.dateTime).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {getTimeAgo(crime.dateTime)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            crime.category.includes('Theft') ? 'bg-orange-100 text-orange-800' :
                            crime.category.includes('Assault') ? 'bg-red-100 text-red-800' :
                            crime.category.includes('Harassment') ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {crime.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <MapPin size={16} className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-900">{crime.address}</span>
                          </div>
                        </td>
                        {userLocation && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {userLocation 
                              ? `${calculateDistance(
                                  userLocation[0], 
                                  userLocation[1], 
                                  crime.coordinates[0], 
                                  crime.coordinates[1]
                                ).toFixed(1)} km`
                              : 'N/A'
                            }
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> of{' '}
                        <span className="font-medium">{filteredData.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronLeft size={18} />
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                currentPage === pageNum
                                  ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight size={18} />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrimeFeedPage;