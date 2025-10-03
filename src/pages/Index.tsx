import React from 'react';
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AppFooter from "@/components/AppFooter";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Plus, Star, Award, Gift, User as UserIcon, DollarSign } from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';
import InstallPrompt from '@/components/InstallPrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import BottomNavigation from '@/components/BottomNavigation';
import OnboardingWalkthrough from '@/components/OnboardingWalkthrough'; // New import
import { usePWA } from '@/hooks/use-pwa';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { useNavigate } from 'react-router-dom';
import { useModal } from '@/components/ModalProvider';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getCategoryName = (category: string) => {
  const names: { [key: string]: string } = {
    all: 'All Services',
    cleaning: 'Cleaning',
    moving: 'Moving',
    assembly: 'Assembly',
    repairs: 'Repairs',
    delivery: 'Delivery',
    mounting: 'Mounting',
    painting: 'Painting',
    marketing: 'Marketing',
    other: 'Other'
  };
  return names[category] || 'Task';
};

const Index = () => {
  const { isOnline, showInstallPrompt, installApp, closeInstallPrompt, showSplashScreen } = usePWA();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { openPostTaskModal, openLoginModal } = useModal();
  const navigate = useNavigate();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { allTaskerProfiles, loading: taskerProfilesLoading } = useTaskerProfile();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [minBudget, setMinBudget] = React.useState('');
  const [maxBudget, setMaxBudget] = React.useState('');
  const [filterLocation, setFilterLocation] = React.useState('');
  const [showOnboarding, setShowOnboarding] = React.useState(false); // State for onboarding visibility

  React.useEffect(() => {
    // Check if onboarding has been seen before
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleSignOut = async () => {
    await logout();
  };

  const handleSearchSubmit = () => {
    console.log("Searching for:", searchTerm, "in category:", selectedCategory, "min budget:", minBudget, "max budget:", maxBudget, "location:", filterLocation);
    // In a real app, this would trigger a backend search or more complex client-side filtering
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchTerm('');
  };

  const handleViewTaskDetails = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setMinBudget('');
    setMaxBudget('');
    setFilterLocation('');
  };

  // Perform filtering locally in Index.tsx using React.useMemo for efficiency
  const filteredTasks = React.useMemo(() => {
    let currentFilteredTasks = tasks;

    if (selectedCategory && selectedCategory !== 'all') {
      currentFilteredTasks = currentFilteredTasks.filter(task => task.category === selectedCategory);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFilteredTasks = currentFilteredTasks.filter(task =>
        task.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        task.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        task.location.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (minBudget) {
      const min = parseFloat(minBudget);
      if (!isNaN(min)) {
        currentFilteredTasks = currentFilteredTasks.filter(task => task.budget >= min);
      }
    }

    if (maxBudget) {
      const max = parseFloat(maxBudget);
      if (!isNaN(max)) {
        currentFilteredTasks = currentFilteredTasks.filter(task => task.budget <= max);
      }
    }

    if (filterLocation) {
      const lowerCaseFilterLocation = filterLocation.toLowerCase();
      currentFilteredTasks = currentFilteredTasks.filter(task =>
        task.location.toLowerCase().includes(lowerCaseFilterLocation)
      );
    }

    return currentFilteredTasks;
  }, [tasks, searchTerm, selectedCategory, minBudget, maxBudget, filterLocation]);

  // Select 5 featured tasks (e.g., the first 5 open tasks)
  const featuredTasks = React.useMemo(() => {
    return tasks.filter(task => task.status === 'open').slice(0, 5);
  }, [tasks]);

  // Select 3 top taskers (e.g., the first 3 from allTaskerProfiles)
  const topTaskers = React.useMemo(() => {
    return allTaskerProfiles.slice(0, 3);
  }, [allTaskerProfiles]);


  return (
    <div className="min-h-screen bg-[hsl(var(--bg-light))] dark:bg-gray-900 text-[hsl(var(--text-dark))] dark:text-gray-100 pb-16 md:pb-0">
      {/* SplashScreen is now always rendered, but its visibility is controlled by CSS */}
      <div className={cn(
        "fixed inset-0 z-[9999] transition-opacity duration-500",
        showSplashScreen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        <SplashScreen />
      </div>

      <OfflineIndicator isVisible={!isOnline} />

      <Header
        isAuthenticated={isAuthenticated}
        onSignOut={handleSignOut}
      />
      <HeroSection
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
      />
      <main className="container mx-auto p-4 pt-[60px]">
        <CategoriesSection
          activeCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />

        {/* Filter Section */}
        <section className="py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg my-8 p-6">
          <h2 className="text-2xl font-bold text-[hsl(var(--primary-color))] mb-6">Refine Your Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="filterLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <Input
                id="filterLocation"
                type="text"
                placeholder="e.g., 'Makati City'"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="minBudget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Budget (₱)</label>
              <Input
                id="minBudget"
                type="number"
                placeholder="e.g., 500"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="maxBudget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Budget (₱)</label>
              <Input
                id="maxBudget"
                type="number"
                placeholder="e.g., 2000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={handleResetFilters} variant="outline" className="border-gray-400 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
              Reset Filters
            </Button>
            <Button onClick={handleSearchSubmit} className="bg-[hsl(var(--primary-color))] text-white hover:bg-[hsl(var(--primary-color))]">
              Apply Filters
            </Button>
          </div>
        </section>

        {/* Featured Tasks Section */}
        <section id="featured-tasks" className="py-8">
          <h2 className="text-4xl font-bold text-[hsl(var(--primary-color))] mb-8 text-center">✨ Featured Tasks</h2>
          {tasksLoading ? (
            <p className="text-center text-gray-500 italic py-8">Loading featured tasks...</p>
          ) : featuredTasks.length === 0 ? (
            <p className="text-center text-gray-500 italic py-8">No featured tasks available right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTasks.map((task) => (
                <Card key={task.id} className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-[var(--border-radius)] overflow-hidden">
                  <div className="h-40 overflow-hidden relative">
                    <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute top-2 left-2 bg-[hsl(var(--primary-color))] text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {getCategoryName(task.category)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                    <p className="text-[hsl(var(--text-light))] flex items-center mb-2">
                      <MapPin size={16} className="mr-2" /> {task.location}
                    </p>
                    <p className="text-2xl font-bold text-[hsl(var(--primary-color))] mb-4">₱{task.budget.toLocaleString()}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img src={task.posterAvatar} alt={task.posterName} className="w-8 h-8 rounded-full object-cover border-2 border-[hsl(var(--border-color))]" />
                        <span className="font-medium">{task.posterName}</span>
                      </div>
                      <Button variant="outline" onClick={() => handleViewTaskDetails(task.id)} className="border-[hsl(var(--primary-color))] text-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] hover:text-white">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Tasks Section (Existing) */}
        <section id="tasks" className="py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-[hsl(var(--primary-color))]">📋 Available Tasks Near You</h2>
            <Button onClick={openPostTaskModal} className="bg-[hsl(var(--primary-color))] text-white hover:bg-[hsl(var(--primary-color))] flex items-center gap-2">
              <Plus size={20} /> Post a Task
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasksError && <p className="col-span-full text-center text-red-500 italic py-8">Error loading tasks: {tasksError}</p>}
            {tasksLoading && <p className="col-span-full text-center text-gray-500 italic py-8">Loading tasks...</p>}
            {!tasksLoading && (filteredTasks || []).length === 0 && !tasksError ? (
              <p className="col-span-full text-center text-gray-500 italic py-8">No tasks found matching your criteria. Try adjusting your filters!</p>
            ) : (
              (filteredTasks || []).map((task) => (
                <Card key={task.id} className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-[var(--border-radius)] overflow-hidden">
                  <div className="h-40 overflow-hidden relative">
                    <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute top-2 left-2 bg-[hsl(var(--primary-color))] text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {getCategoryName(task.category)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                    <p className="text-[hsl(var(--text-light))] flex items-center mb-2">
                      <MapPin size={16} className="mr-2" /> {task.location}
                    </p>
                    <p className="text-2xl font-bold text-[hsl(var(--primary-color))] mb-4">₱{task.budget.toLocaleString()}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img src={task.posterAvatar} alt={task.posterName} className="w-8 h-8 rounded-full object-cover border-2 border-[hsl(var(--border-color))]" />
                        <span className="font-medium">{task.posterName}</span>
                      </div>
                      <Button variant="outline" onClick={() => handleViewTaskDetails(task.id)} className="border-[hsl(var(--primary-color))] text-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] hover:text-white">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Top Taskers Section */}
        <section id="top-taskers" className="py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg my-8 p-6">
          <h2 className="text-4xl font-bold text-[hsl(var(--primary-color))] mb-8 text-center">⭐ Top Taskers</h2>
          {taskerProfilesLoading ? (
            <p className="text-center text-gray-500 italic py-8">Loading top taskers...</p>
          ) : topTaskers.length === 0 ? (
            <p className="text-center text-gray-500 italic py-8">No top taskers available yet. Be the first to register!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topTaskers.map((tasker) => (
                <Card key={tasker.userId} className="shadow-md hover:shadow-lg transition-shadow duration-300 rounded-[var(--border-radius)]">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <Avatar className="w-20 h-20 mb-3 border-2 border-green-500">
                      <AvatarImage src={tasker.photoURL || undefined} alt={tasker.displayName} />
                      <AvatarFallback className="bg-green-200 text-green-800 text-2xl font-semibold">
                        {tasker.displayName ? tasker.displayName.charAt(0).toUpperCase() : <UserIcon size={24} />}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold mb-1">{tasker.displayName}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">{tasker.bio}</p>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-3">
                      <DollarSign size={16} /> <span>₱{tasker.hourlyRate.toLocaleString()}/hr</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {tasker.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 px-2 py-0.5 text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {tasker.skills.length > 3 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 px-2 py-0.5 text-xs">
                          +{tasker.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" onClick={() => navigate(`/taskers/${tasker.userId}`)} className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Gamification Badges Placeholder */}
        <section id="gamification" className="py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg my-8 p-6 text-center">
          <h2 className="text-4xl font-bold text-[hsl(var(--primary-color))] mb-8">🏆 Earn Badges!</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Complete tasks, get 5-star ratings, and be a fast responder to earn exclusive Tasko badges!
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            <div className="flex flex-col items-center text-center">
              <Award size={48} className="text-yellow-500 mb-2" />
              <p className="font-semibold text-gray-800 dark:text-gray-100">5-Star Rated</p>
              <span className="text-sm text-gray-600 dark:text-gray-400">Achieve perfect ratings</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Award size={48} className="text-blue-500 mb-2" />
              <p className="font-semibold text-gray-800 dark:text-gray-100">Fast Responder</p>
              <span className="text-sm text-gray-600 dark:text-gray-400">Reply quickly to clients</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Award size={48} className="text-purple-500 mb-2" />
              <p className="font-semibold text-gray-800 dark:text-gray-100">Task Master</p>
              <span className="text-sm text-gray-600 dark:text-gray-400">Complete many tasks</span>
            </div>
          </div>
        </section>

        {/* Referral Promo Placeholder */}
        <section id="referral-promo" className="py-8 bg-[hsl(var(--primary-color))] text-white rounded-lg shadow-lg my-8 p-6 text-center">
          <h2 className="text-4xl font-bold mb-4">🤝 Invite Friends & Earn!</h2>
          <p className="text-lg mb-6">
            Refer a friend to Tasko and both of you will earn ₱50 credits!
          </p>
          <Button className="bg-[hsl(var(--secondary-color))] hover:bg-[#e05a00] text-white text-lg px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 mx-auto">
            <Gift size={24} /> Refer Now!
          </Button>
        </section>

        <HowItWorksSection />
      </main>
      <AppFooter />
      <MadeWithDyad />

      <InstallPrompt
        isVisible={showInstallPrompt}
        onInstall={installApp}
        onClose={closeInstallPrompt}
      />
      <BottomNavigation />

      {showOnboarding && <OnboardingWalkthrough onClose={() => setShowOnboarding(false)} />}
    </div>
  );
};

export default Index;