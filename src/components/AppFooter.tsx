import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const AppFooter: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-10 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Us */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">About Tasko</h3>
          <p className="text-sm">
            Tasko connects you with trusted local taskers for all your needs, from home cleaning and repairs to moving and delivery services. Get things done, hassle-free.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="text-sm hover:text-green-400 transition-colors">Home</Link></li>
            <li><a href="#categories" className="text-sm hover:text-green-400 transition-colors">Services</a></li>
            <li><Link to="/browse-taskers" className="text-sm hover:text-green-400 transition-colors">Browse Taskers</Link></li>
            <li><Link to="/my-tasks" className="text-sm hover:text-green-400 transition-colors">My Tasks</Link></li>
            <li><Link to="/features-earnings" className="text-sm hover:text-green-400 transition-colors">Become a Tasker</Link></li>
            <li><a href="#how-it-works" className="text-sm hover:text-green-400 transition-colors">How It Works</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Support</h3>
          <ul className="space-y-2">
            <li><Link to="/faq" className="text-sm hover:text-green-400 transition-colors">FAQ</Link></li>
            <li><Link to="/contact" className="text-sm hover:text-green-400 transition-colors">Contact Us</Link></li>
            <li><Link to="/chat" className="text-sm hover:text-green-400 transition-colors">Chat</Link></li> {/* New Link */}
            <li><Link to="/privacy" className="text-sm hover:text-green-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="text-sm hover:text-green-400 transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Connect With Us & App Downloads */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Download Our App</h3>
          <div className="flex space-x-4 mb-6">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Facebook size={24} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Twitter size={24} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Instagram size={24} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin size={24} />
            </a>
          </div>
          <h3 className="text-white text-lg font-semibold mb-4">Download Our App</h3>
          <div className="flex space-x-4">
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
              <img src="/google-play-badge.png" alt="Get it on Google Play" className="h-10" />
            </a>
            <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
              <img src="/app-store-badge.png" alt="Download on the App Store" className="h-10" />
            </a>
          </div>
          <p className="text-sm mt-6">&copy; {new Date().getFullYear()} Tasko. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;