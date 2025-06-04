import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, MapPin, Bell, ChevronRight } from 'lucide-react';
import HeroImage from '../components/landing/HeroImage';
import FeatureCard from '../components/landing/FeatureCard';
import TestimonialSection from '../components/landing/TestimonialSection';
import SafetyStatsSection from '../components/landing/SafetyStatsSection';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Navigate <span className="text-yellow-400">Safely</span>, Live Fearlessly
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              ShaktiPath helps women navigate urban environments with confidence by providing safety-scored routes and real-time safety information.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to={isAuthenticated ? "/map" : "/register"} 
                className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center"
              >
                {isAuthenticated ? "Open Map" : "Sign Up Now"}
                <ChevronRight size={18} className="ml-1" />
              </Link>
              <Link 
                to={isAuthenticated ? "/crimes" : "/login"} 
                className="bg-transparent border-2 border-white hover:border-yellow-400 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center"
              >
                {isAuthenticated ? "View Crime Feed" : "Login"}
                <ChevronRight size={18} className="ml-1" />
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <HeroImage />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">How ShaktiPath Works</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our platform combines real-time data with historical crime statistics to provide you with the safest possible routes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MapPin size={32} className="text-blue-700" />}
              title="Safety-Scored Routes"
              description="Get color-coded routes based on real crime data to avoid high-risk areas and travel with confidence."
            />
            <FeatureCard 
              icon={<Shield size={32} className="text-blue-700" />}
              title="Safety Points of Interest"
              description="Easily locate nearby police stations, hospitals, and identify areas with liquor shops to stay informed."
            />
            <FeatureCard 
              icon={<Bell size={32} className="text-blue-700" />}
              title="Real-time Crime Alerts"
              description="Stay updated with the latest incidents in your area with our curated crime feed and filtering options."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <SafetyStatsSection />

      {/* Testimonials */}
      <TestimonialSection />

      {/* CTA Section */}
      <section className="w-full py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Start Your Safe Journey Today</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of women who navigate their cities with confidence using ShaktiPath's safety features.
          </p>
          <Link 
            to={isAuthenticated ? "/map" : "/register"} 
            className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-semibold py-3 px-8 rounded-lg inline-flex items-center transition-all"
          >
            {isAuthenticated ? "Open Map" : "Get Started"}
            <ChevronRight size={18} className="ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;