import React from 'react';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const AppFooter: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: Logo and Description */}
        <div className="col-span-full md:col-span-1 text-center md:text-left">
          <h3 className="text-2xl font-bold text-white mb-4">Tasko</h3>
          <p className="text-sm">
            Connecting people who need tasks done with trusted local taskers.
            Your everyday tasks, simplified.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-green-500 transition-colors">Home</Link></li>
            <li><a href="#categories" className="hover:text-green-500 transition-colors">Services</a></li>
            <li><a href="#tasks" className="hover:text-green-500 transition-colors">Available Tasks</a></li>
            <li><a href="#how-it-works" className="hover:text-green-500 transition-colors">How It Works</a></li>
            <li><a href="#become-tasker" className="hover:text-green-500 transition-colors">Become a Tasker</a></li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
          <ul className="space-y-2">
            <li><Link to="/faq" className="hover:text-green-500 transition-colors">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-green-500 transition-colors">Contact Us</Link></li>
            <li><Link to="/privacy" className="hover:text-green-500 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-green-500 transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Column 4: Social Media */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors">
              <Facebook size={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors">
              <Twitter size={24} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-colors">
              <Instagram size={24} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm">
        &copy; {new Date().getFullYear()} Tasko. All rights reserved.
      </div>
    </footer>
  );
};

export default AppFooter;