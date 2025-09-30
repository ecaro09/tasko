import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Package, Wrench, Hammer, Truck, Monitor } from 'lucide-react';

const categories = [
  { name: "Home Cleaning", icon: Home, description: "Professional cleaning services for your home" },
  { name: "Moving & Packing", icon: Package, description: "Help with packing, lifting, and moving" },
  { name: "Furniture Assembly", icon: Wrench, description: "IKEA and other furniture assembly" },
  { name: "Home Repairs", icon: Hammer, description: "Minor repairs and handyman services" },
  { name: "Delivery Services", icon: Truck, description: "Pick up and deliver items around the city" },
  { name: "Mounting & Installation", icon: Monitor, description: "TV mounting, shelf installation, etc." },
];

const CategoriesSection: React.FC = () => {
  return (
    <section id="categories" className="py-8">
      <h2 className="text-4xl font-bold text-center text-green-600 mb-8">🛠️ Popular Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <CardHeader>
              <div className="text-green-600 text-5xl mb-4 flex justify-center">
                <category.icon size={48} />
              </div>
              <CardTitle className="text-xl font-semibold">{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;