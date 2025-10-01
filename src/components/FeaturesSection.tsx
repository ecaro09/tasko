"use client";

import React from 'react';

export function FeaturesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Feature 1</h3>
            <p className="text-gray-600">Description of feature 1.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Feature 2</h3>
            <p className="text-gray-600">Description of feature 2.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Feature 3</h3>
            <p className="text-gray-600">Description of feature 3.</p>
          </div>
        </div>
      </div>
    </section>
  );
}