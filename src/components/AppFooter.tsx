import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Apple, Play } from 'lucide-react'; // Added Apple and Play icons
import { Button } from '../components/ui/button'; // Assuming Button is already imported or available
import { Link } from 'react-router-dom'; // Import Link

const AppFooter = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Tasko</h3>
          <p className="text-sm mb-2">Your trusted partner for everyday tasks.</p>
          <p className="text-sm">Making life easier, one task at a time.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-white transition-colors duration-200">Home</Link></li>
            <li><a href="#how-it-works" className="hover:text-white transition-colors duration-200">How it Works</a></li>
            <li><Link to="/features-earnings" className="hover:text-white transition-colors duration-200">Become a Tasker</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors duration-200">Help & Support</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Legal</h3>
          <ul className="space-y-2">
            <li><Link to="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</Link></li>
            <li><Link to="/eula" className="hover:text-white transition-colors duration-200">EULA</Link></li>
          </ul>
        </div>

        {/* Download Our App & Social Media */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Download Our App</h3>
          <p className="text-sm mb-4">Get the full Tasko experience on your mobile device.</p>
          <div className="flex flex-col space-y-3 mb-6">
            {/* App Store Buttons */}
            <div className="flex flex-col space-y-3">
              <a href="/app-store-badge.png" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-black text-white hover:bg-gray-700 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg">
                  <Apple size={20} />
                  <div className="flex flex-col items-start">
                    <span className="text-xs">Download on the</span>
                    <span className="text-sm font-semibold">App Store</span>
                  </div>
                </Button>
              </a>
              <a href="/google-play-badge.png" target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-black text-white hover:bg-gray-700 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg">
                  <Play size={20} />
                  <div className="flex flex-col items-start">
                    <span className="text-xs">Get it on</span>
                    <span className="text-sm font-semibold">Google Play</span>
                  </div>
                </Button>
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {/* Removed placeholder social media links */}
              {/* <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200"><Facebook size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200"><Twitter size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200"><Instagram size={24} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200"><Linkedin size={24} /></a> */}
            </div>
          </div>
        </div>
      </div>
      <div className="text-center text-sm text-gray-500 mt-10 border-t border-gray-700 pt-6">
        &copy; {new Date().getFullYear()} Tasko. All rights reserved.
      </div>
    </footer>
  );
};

export default AppFooter;