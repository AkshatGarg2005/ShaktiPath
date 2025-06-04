import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, Phone, Mail, GithubIcon, LinkedinIcon, FacebookIcon, InstagramIcon } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-yellow-400" />
              <span className="ml-2 text-xl font-bold text-white">ShaktiPath</span>
            </div>
            <p className="text-blue-100 mb-4">
              Empowering women to navigate urban spaces safely through technology and community.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors">
                <FacebookIcon size={20} />
              </a>
              <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors">
                <InstagramIcon size={20} />
              </a>
              <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors">
                <LinkedinIcon size={20} />
              </a>
              <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors">
                <GithubIcon size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-blue-100 hover:text-yellow-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/map" className="text-blue-100 hover:text-yellow-400 transition-colors">Safety Map</Link>
              </li>
              <li>
                <Link to="/crimes" className="text-blue-100 hover:text-yellow-400 transition-colors">Crime Feed</Link>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors">Blog</a>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors">Safety Tips</a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors">Emergency Contacts</a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors">Community Guidelines</a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors">FAQs</a>
              </li>
              <li>
                <a href="#" className="text-blue-100 hover:text-yellow-400 transition-colors">Support</a>
              </li>
            </ul>
          </div>
          
          {/* Contact info */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="text-yellow-400 mr-2 mt-1 flex-shrink-0" />
                <span className="text-blue-100">123 Safety Street, Tech Park, Bangalore, Karnataka, India - 560001</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-yellow-400 mr-2" />
                <span className="text-blue-100">+91 80 1234 5678</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-yellow-400 mr-2" />
                <span className="text-blue-100">support@shaktipath.org</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-blue-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-100 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} ShaktiPath. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-blue-100 hover:text-yellow-400 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-blue-100 hover:text-yellow-400 text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-blue-100 hover:text-yellow-400 text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;