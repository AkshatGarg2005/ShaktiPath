import React from 'react';

const HeroImage: React.FC = () => {
  return (
    <div className="relative w-full max-w-md">
      <img 
        src="https://images.pexels.com/photos/7709287/pexels-photo-7709287.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
        alt="Woman using ShaktiPath app" 
        className="rounded-lg shadow-xl z-10 relative"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700/30 to-transparent rounded-lg z-20"></div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full z-0"></div>
      <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-600 rounded-full z-0"></div>
    </div>
  );
};

export default HeroImage;