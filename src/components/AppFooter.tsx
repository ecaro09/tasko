import React from 'react';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AppFooter: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Section 1: Tasko PH */}
          <div>
            <h3 className="text-xl font-bold mb-4">Tasko PH</h3>
            <p className="text-gray-400 mb-4">Connecting Filipinos with trusted taskers for everyday needs. Fast, reliable, and affordable services.</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Info</h3>
            <p className="text-gray-400 flex items-center mb-2"><MapPin size={18} className="mr-2" /> Metro Manila, Philippines</p>
            <p className="text-gray-400 flex items-center mb-2"><Phone size={18} className="mr-2" /> +63 912 345 6789</p>
            <p className="text-gray-400 flex items-center mb-2"><Mail size={18} className="mr-2" /> help@tasko.ph</p>
            <p className="text-gray-400 flex items-center mb-2"><Clock size={18} className="mr-2" /> 24/7 Customer Support</p>
          </div>

          {/* Section 3: Popular Services */}
          <div>
            <h3 className="text-xl font-bold mb-4">Popular Services</h3>
            <Link to="#" className="text-gray-400 block mb-2 hover:text-white transition-colors">House Cleaning</Link>
            <Link to="#" className="text-gray-400 block mb-2 hover:text-white transition-colors">Moving Help</Link>
            <Link to="#" className="text-gray-400 block mb-2 hover:text-white transition-colors">Furniture Assembly</Link>
            <Link to="#" className="text-gray-400 block mb-2 hover:text-white transition-colors">Minor Repairs</Link>
            <Link to="#" className="text-gray-400 block mb-2 hover:text-white transition-colors">Delivery Services</Link>
          </div>

          {/* Section 4: Company */}
          <div>
            <h3 className="text-xl font-bold mb-4">Company</h3>
            <Link to="#" className="text-gray-400 block mb-2 hover:text-white transition-colors">About Us</Link>
            <Link to="#" className="text-gray-400 block mb-2 hover:text-white transition-colors">Careers</Link>
            <Link to="#" className="text-gray-400 block mb-2 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-gray-400 block mb-2 hover:text-white transition-colors">Terms of Service</Link>
            <Link to="#" className="text-gray-400 block mb-2 hover:text-white transition-colors">Blog</Link>
          </div>
        </div>

        <div className="text-center mt-12 pt-8 border-t border-gray-800 text-gray-500">
          <p>&copy; 2023 Tasko Philippines. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;