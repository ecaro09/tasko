import React from 'react';
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AppFooter from "@/components/AppFooter";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster } from "@/components/ui/sonner"; // Using sonner for toasts
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from 'lucide-react';

// Placeholder for task data - will be replaced with Firebase later
const sampleTasks = [
  {
    id: "1",
    title: "Furniture Assembly Needed",
    category: "assembly",
    description: "Need help assembling IKEA bed and wardrobe. All parts are available.",
    location: "Quezon City, Metro Manila",
    budget: 800,
    posterName: "Maria Santos",
    posterAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
    datePosted: "2023-06-15",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1581093458791-8a6b5d174d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "2",
    title: "Apartment Cleaning",
    category: "cleaning",
    description: "General cleaning for 2-bedroom apartment. Includes sweeping, mopping, and bathroom cleaning.",
    location: "Makati City, Metro Manila",
    budget: 1200,
    posterName: "Juan Dela Cruz",
    posterAvatar: "https://randomuser.me/api/portraits/men/54.jpg",
    datePosted: "2023-06-14",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "3",
    title: "Help with Moving",
    category: "moving",
    description: "Need assistance moving furniture from 2nd floor to ground floor. No heavy lifting required.",
    location: "Mandaluyong City, Metro Manila",
    budget: 1500,
    posterName: "Ana Reyes",
    posterAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
    datePosted: "2023-06-13",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
];

const Index = () => {
  // Placeholder state for UI, Firebase integration will come later
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [tasks, setTasks] = React.useState(sampleTasks); // Using sample tasks for now

  const handleSignIn = () => {
    // This will be replaced with Firebase auth logic
    console.log("Sign In clicked (Firebase auth not yet active)");
    setIsAuthenticated(true); // Simulate sign-in for UI
  };

  const handleSignOut = () => {
    // This will be replaced with Firebase auth logic
    console.log("Sign Out clicked (Firebase auth not yet active)");
    setIsAuthenticated(false); // Simulate sign-out for UI
    setTasks(sampleTasks); // Reset tasks on logout (or clear if user-specific)
  };

  const handlePostTask = () => {
    console.log("Post a Task clicked (modal/Firebase logic not yet active)");
    // This will eventually open a modal for posting a task
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header
        isAuthenticated={isAuthenticated}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />
      <HeroSection />
      <main className="container mx-auto p-4">
        <CategoriesSection />

        {/* Tasks Section */}
        <section id="tasks" className="py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-green-600">📋 Available Tasks Near You</h2>
            <Button onClick={handlePostTask} className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2">
              <span className="fas fa-plus"></span> Post a Task
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <Card key={task.id} className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-40 overflow-hidden">
                    <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                    <p className="text-gray-600 flex items-center mb-2">
                      <MapPin size={16} className="mr-2" /> {task.location}
                    </p>
                    <p className="text-2xl font-bold text-green-600 mb-4">₱{task.budget.toLocaleString()}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img src={task.posterAvatar} alt={task.posterName} className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-medium">{task.posterName}</span>
                      </div>
                      <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 italic py-8">No tasks found. Try a different search or category.</p>
            )}
          </div>
        </section>

        <HowItWorksSection />
      </main>
      <AppFooter />
      <MadeWithDyad />
      <Toaster /> {/* Add Toaster for sonner notifications */}
    </div>
  );
};

export default Index;