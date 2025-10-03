import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const AppFooter = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-10 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Us */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">About Us</h3>
          <p className="text-sm leading-relaxed">
            Taskly connects you with skilled taskers for all your needs, from home repairs to personal errands.
            We're dedicated to making your life easier and more efficient.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/features-earnings" className="hover:text-blue-400 transition-colors duration-200">Features & Earnings</Link></li>
            <li><Link to="/browse-taskers" className="hover:text-blue-400 transition-colors duration-200">Browse Taskers</Link></li>
            <li><Link to="/my-tasks" className="hover:text-blue-400 transition-colors duration-200">My Tasks</Link></li>
            <li><Link to="/profile" className="hover:text-blue-400 transition-colors duration-200">Profile</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Support</h3>
          <ul className="space-y-2">
            <li><Link to="/faq" className="hover:text-blue-400 transition-colors duration-200">FAQ</Link></li>
            <li><Link to="/contact" className="hover:text-blue-400 transition-colors duration-200">Contact Us</Link></li>
            <li><Link to="/privacy" className="hover:text-blue-400 transition-colors duration-200">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-blue-400 transition-colors duration-200">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Download Our App & Social Media */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Download Our App</h3>
          <p className="text-sm mb-4">Get the full Taskly experience on your mobile device.</p>
          <div className="flex flex-col space-y-3 mb-6">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                className="h-10 w-auto object-contain"
              />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                alt="Download on the App Store"
                className="h-10 w-auto object-contain"
              />
            </a>
          </div>

          <h3 className="text-xl font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
              <Facebook size={24} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
              <Twitter size={24} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
              <Instagram size={24} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
              <Linkedin size={24} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-10 pt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Taskly. All rights reserved.
      </div>
    </footer>
  );
};

export default AppFooter;