import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram } from 'lucide-react';

const AppFooter: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Us */}
        <div>
          <h3 className="text-xl font-bold mb-4">Tasko</h3>
          <p className="text-gray-400 text-sm">
            Your trusted platform for connecting with skilled taskers across the Philippines.
            Get help with cleaning, repairs, moving, and more, quickly and reliably.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Home</a></li>
            <li><a href="#categories" className="text-gray-400 hover:text-white transition-colors text-sm">Services</a></li>
            <li><a href="#tasks" className="text-gray-400 hover:text-white transition-colors text-sm">Available Tasks</a></li>
            <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How It Works</a></li>
            <li><a href="#become-tasker" className="text-gray-400 hover:text-white transition-colors text-sm">Become a Tasker</a></li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h3 className="text-xl font-bold mb-4">Contact Us</h3>
          <div className="text-sm">
            <p className="text-gray-400 flex items-center mb-2"><MapPin size={18} className="mr-2" /> Metro Manila, Philippines</p>
            <p className="text-gray-400 flex items-center mb-2"><Phone size={18} className="mr-2" /> +63992 492 5559</p>
            <p className="text-gray-400 flex items-center mb-2"><Mail size={18} className="mr-2" /> help@tasko.ph</p>
            <p className="text-gray-400 flex items-center mb-2"><Clock size={18} className="mr-2" /> 24/7 Customer Support</p>
          </div>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="text-xl font-bold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Facebook size={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Twitter size={24} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Instagram size={24} />
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 text-center text-gray-500 text-sm mt-8 pt-8 border-t border-gray-700">
        &copy; {new Date().getFullYear()} Tasko Philippines. All rights reserved.
      </div>
    </footer>
  );
};

export default AppFooter;