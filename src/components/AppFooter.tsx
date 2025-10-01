"use client";

import { Link } from "react-router-dom";

export function AppFooter() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">About Tasko</h3>
            <p className="text-gray-400">
              Tasko helps you manage your tasks efficiently, whether for personal use or team collaboration. Stay organized and boost your productivity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Download Apps */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Download Our Apps</h3>
            <div className="flex space-x-4">
              <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                <img src="/google-play-badge.png" alt="Get it on Google Play" className="h-10" loading="lazy" />
              </a>
              <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                <img src="/app-store-badge.png" alt="Download on the App Store" className="h-10" loading="lazy" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500">
          &copy; {new Date().getFullYear()} Tasko. All rights reserved.
        </div>
      </div>
    </footer>
  );
}