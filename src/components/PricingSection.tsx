"use client";

import React from 'react';

export function PricingSection() {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">Simple & Transparent Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-2xl font-semibold mb-4">Basic</h3>
            <p className="text-4xl font-bold mb-4">$9<span className="text-lg font-normal">/month</span></p>
            <ul className="text-gray-700 space-y-2 mb-6">
              <li>5 Projects</li>
              <li>10GB Storage</li>
              <li>Basic Support</li>
            </ul>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">Get Started</button>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md border border-blue-500">
            <h3 className="text-2xl font-semibold mb-4">Pro</h3>
            <p className="text-4xl font-bold mb-4">$19<span className="text-lg font-normal">/month</span></p>
            <ul className="text-gray-700 space-y-2 mb-6">
              <li>Unlimited Projects</li>
              <li>100GB Storage</li>
              <li>Priority Support</li>
            </ul>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">Get Started</button>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-2xl font-semibold mb-4">Enterprise</h3>
            <p className="text-4xl font-bold mb-4">$49<span className="text-lg font-normal">/month</span></p>
            <ul className="text-gray-700 space-y-2 mb-6">
              <li>Custom Projects</li>
              <li>Unlimited Storage</li>
              <li>24/7 Support</li>
            </ul>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">Contact Us</button>
          </div>
        </div>
      </div>
    </section>
  );
}