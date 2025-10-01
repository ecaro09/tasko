"use client";

import React from 'react';

export function CallToActionSection() {
  return (
    <section className="py-16 bg-blue-600 text-white text-center">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4">Ready to Boost Your Productivity?</h2>
        <p className="text-lg mb-8">Join thousands of satisfied users and start managing your tasks smarter today!</p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors">
          Get Started Free
        </button>
      </div>
    </section>
  );
}