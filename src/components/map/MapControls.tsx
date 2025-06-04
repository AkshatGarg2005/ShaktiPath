import React from 'react';
import { useMap } from 'react-leaflet';
import { ZoomIn, ZoomOut, Navigation } from 'lucide-react';

const MapControls: React.FC = () => {
  const map = useMap();
  
  const handleZoomIn = () => {
    map.zoomIn();
  };
  
  const handleZoomOut = () => {
    map.zoomOut();
  };
  
  const handleLocateMe = () => {
    map.locate({ setView: true, maxZoom: 15 });
  };
  
  return (
    <div className="absolute left-4 bottom-4 z-[1000] flex flex-col space-y-2">
      <button 
        onClick={handleZoomIn}
        className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-gray-100"
        title="Zoom In"
      >
        <ZoomIn size={20} className="text-gray-700" />
      </button>
      <button 
        onClick={handleZoomOut}
        className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-gray-100"
        title="Zoom Out"
      >
        <ZoomOut size={20} className="text-gray-700" />
      </button>
      <button 
        onClick={handleLocateMe}
        className="bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center hover:bg-gray-100"
        title="Locate Me"
      >
        <Navigation size={20} className="text-gray-700" />
      </button>
    </div>
  );
};

export default MapControls;