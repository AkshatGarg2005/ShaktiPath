import React from 'react';

const SafetyLegend: React.FC = () => {
  return (
    <div className="absolute bottom-6 right-6 bg-white p-3 rounded-lg shadow-md z-[1000]">
      <div className="text-sm font-semibold mb-2">Route Safety</div>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-6 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-700">High Risk</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-700">Moderate Risk</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-700">Low Risk</span>
        </div>
      </div>
    </div>
  );
};

export default SafetyLegend;