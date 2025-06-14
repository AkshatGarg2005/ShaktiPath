import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Navigation, 
  Eye, 
  Lightbulb, 
  Users, 
  MapPin, 
  CheckCircle, 
  Smartphone,
  Clock,
  Star,
  ArrowRight,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Map
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const features = [
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Street Light Mapping",
      description: "Real-time tracking of well-lit streets to ensure you're always walking in bright, visible areas."
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "CCTV Density Analysis",
      description: "Routes prioritized through areas with high surveillance coverage for enhanced security."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Police Station Proximity",
      description: "Paths planned near police stations and security checkpoints for immediate help access."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Crowd Intelligence",
      description: "Live crowd data to recommend busier, safer routes with more people around."
    },
    {
      icon: <Navigation className="h-8 w-8" />,
      title: "Smart Route Avoidance",
      description: "Automatically avoids liquor shops and other potentially unsafe areas."
    }
  ];

  const stats = [
    { number: "50K+", label: "Women Protected Daily" },
    { number: "1M+", label: "Safe Routes Mapped" },
    { number: "500+", label: "Cities Covered" },
    { number: "4.9★", label: "User Rating" }
  ];

  const steps = [
    {
      step: "1",
      title: "Enter Destination",
      description: "Simply input where you want to go"
    },
    {
      step: "2",
      title: "AI Safety Analysis",
      description: "Our algorithm analyzes 5 safety factors"
    },
    {
      step: "3",
      title: "Get Safe Route",
      description: "Receive the safest path with real-time updates"
    }
  ];

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ShaktiPath
              </span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">How It Works</a>
              <a href="#about" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">About</a>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/map" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Map className="h-4 w-4" />
                    <span>Go to Map</span>
                  </Link>
                  
                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-purple-50"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">{user?.full_name?.split(' ')[0]}</span>
                    </button>
                    
                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Link 
                          to="/profile/edit"
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Edit Profile</span>
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-700 hover:text-purple-600 font-medium">Features</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 font-medium">How It Works</a>
                <a href="#about" className="text-gray-700 hover:text-purple-600 font-medium">About</a>
                
                {isAuthenticated ? (
                  <>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                      </div>
                      <Link 
                        to="/map" 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-medium w-full text-center flex items-center justify-center space-x-2 mb-3"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Map className="h-4 w-4" />
                        <span>Go to Map</span>
                      </Link>
                      <Link 
                        to="/profile/edit"
                        className="w-full text-left text-gray-700 hover:text-purple-600 font-medium flex items-center space-x-2 mb-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Edit Profile</span>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left text-gray-700 hover:text-purple-600 font-medium flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">Login</Link>
                    <Link 
                      to="/register" 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-medium w-full text-center"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {isAuthenticated ? (
                  <>
                    Welcome back,
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
                      {user?.full_name?.split(' ')[0]}!
                    </span>
                  </>
                ) : (
                  <>
                    Your Safe
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent block">
                      Journey Starts Here
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xl text-gray-600 mt-6 max-w-lg">
                {isAuthenticated ? (
                  "Ready to plan your next safe journey? Use our AI-powered route planning to navigate with confidence."
                ) : (
                  "Navigate with confidence using AI-powered route planning that prioritizes your safety through intelligent analysis of street lighting, surveillance, and crowd data."
                )}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/map"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Map className="h-5 w-5" />
                      <span>Plan Safe Route</span>
                    </Link>
                    <Link
                      to="/profile/edit"
                      className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-600 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Manage Profile</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/register"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Smartphone className="h-5 w-5" />
                      <span>Start Your Safe Journey</span>
                    </Link>
                    <button className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-600 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2">
                      <span>Learn More</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 transform rotate-3 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 transform -rotate-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      <span className="text-gray-800 font-medium">
                        {isAuthenticated ? `Route for ${user?.full_name?.split(' ')[0]}` : 'Route to Home'}
                      </span>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-800 font-medium">Safe Route Found</span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">Well-lit path with high CCTV coverage</p>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Distance: 2.4 km</span>
                      <span>ETA: 8 mins</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-purple-600">{stat.number}</div>
                <div className="text-gray-600 mt-2 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              5-Point Safety Intelligence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our advanced AI analyzes multiple safety factors in real-time to recommend the most secure routes for your journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-purple-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
            
            {/* Emergency Feature */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Emergency SOS</h3>
              <p className="leading-relaxed">One-tap emergency alert system that instantly notifies your trusted contacts and nearby authorities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How ShaktiPath Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to safer navigation powered by advanced AI and real-time data analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 lg:p-12 text-center">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              {isAuthenticated ? "Ready for Your Next Safe Journey?" : "Ready to Experience Safer Travel?"}
            </h3>
            <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
              {isAuthenticated ? 
                "Your profile is set up and ready. Start planning your safe routes with our advanced AI analysis." :
                "Join thousands of women who trust ShaktiPath for their daily commute and late-night travels."
              }
            </p>
            {isAuthenticated ? (
              <Link 
                to="/map"
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center justify-center space-x-2"
              >
                <Map className="h-5 w-5" />
                <span>Plan Your Route Now</span>
              </Link>
            ) : (
              <Link 
                to="/register"
                className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center justify-center space-x-2"
              >
                <Smartphone className="h-5 w-5" />
                <span>Get Started - It's Free</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Women Everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "Software Engineer",
                content: "ShaktiPath has completely changed how I navigate the city. I feel so much safer knowing my route is optimized for security.",
                rating: 5
              },
              {
                name: "Anita Patel",
                role: "College Student",
                content: "The emergency SOS feature gives me and my parents peace of mind. This app is essential for every woman.",
                rating: 5
              },
              {
                name: "Dr. Meera Singh",
                role: "Medical Professional",
                content: "Working late shifts, I rely on ShaktiPath daily. The CCTV and police station mapping is incredibly accurate.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-purple-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 ShaktiPath. All rights reserved. Made with ❤️ for women's safety.</p>
          </div>
        </div>
      </footer>

      {/* Click outside to close profile menu */}
      {isProfileMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default LandingPage;