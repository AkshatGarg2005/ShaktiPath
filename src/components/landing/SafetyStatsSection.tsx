import React from 'react';
import { Shield, UserCheck, MapPin, Clock } from 'lucide-react';

const stats = [
  {
    id: 1,
    value: "50,000+",
    label: "Active Users",
    icon: <UserCheck size={24} className="text-blue-600" />,
  },
  {
    id: 2,
    value: "100,000+",
    label: "Routes Planned",
    icon: <MapPin size={24} className="text-blue-600" />,
  },
  {
    id: 3,
    value: "15,000+",
    label: "Safety Points Mapped",
    icon: <Shield size={24} className="text-blue-600" />,
  },
  {
    id: 4,
    value: "24/7",
    label: "Real-time Updates",
    icon: <Clock size={24} className="text-blue-600" />,
  },
];

const SafetyStatsSection: React.FC = () => {
  return (
    <section className="w-full py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Making Cities Safer</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                {stat.icon}
              </div>
              <p className="text-3xl font-bold text-blue-800 mb-1">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SafetyStatsSection;