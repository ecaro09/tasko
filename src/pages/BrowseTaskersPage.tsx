import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Filter, Search, DollarSign, Briefcase, MapPin, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const availableSkills = [
  "Home Cleaning", "Plumbing", "Electrical", "Carpentry", "Moving", "Delivery",
  "Painting", "Furniture Assembly", "Gardening", "Pet Sitting", "Marketing",
  "Web Development", "Graphic Design", "Tutoring", "Photography", "Event Planning", "Other"
];

const BrowseTaskersPage: React.FC = () => {
  const navigate = useNavigate();
  const { allTaskerProfiles, loading, error } = useTaskerProfile();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSkills([]);
    setMinRate('');
    setMaxRate('');
  };

  const filteredTaskers = useMemo(() => {
    let currentFilteredTaskers = allTaskerProfiles;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFilteredTaskers = currentFilteredTaskers.filter(tasker =>
        tasker.displayName.toLowerCase().includes(lowerCaseSearchTerm) ||
        tasker.bio.toLowerCase().includes(lowerCaseSearchTerm) ||
        tasker.skills.some(skill => skill.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    if (selectedSkills.length > 0) {
      currentFilteredTaskers = currentFilteredTaskers.filter(tasker =>
        selectedSkills.some(selectedSkill => tasker.skills.includes(selectedSkill))
      );
    }

    if (minRate) {
      const min = parseFloat(minRate);
      if (!isNaN(min)) {
        currentFilteredTaskers = currentFilteredTaskers.filter(tasker => tasker.hourlyRate >= min);
      }
    }

    if (maxRate) {
      const max = parseFloat(maxRate);
      if (!isNaN(max)) {
        currentFilteredTaskers = currentFilteredTaskers.filter(tasker => tasker.hourlyRate <= max);
      }
    }

    return currentFilteredTaskers;
  }, [allTaskerProfiles, searchTerm, selectedSkills, minRate, maxRate]);

  if (loading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading taskers...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500 pt-[80px]">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          &larr; Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Browse Skilled Taskers</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center max-w-3xl mx-auto">
          Find the perfect professional for your task. Filter by skills, ratings, price, and location.
        </p>

        {/* Filter Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-[hsl(var(--primary-color))] mb-4 flex items-center gap-2">
            <Filter size={24} /> Filter Taskers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search by Name or Bio</label>
              <Input
                id="search"
                type="text"
                placeholder="e.g., 'Juan Handyman', 'cleaning expert'"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Hourly Rate (₱)</label>
                <Input
                  id="minRate"
                  type="number"
                  placeholder="e.g., 200"
                  value={minRate}
                  onChange={(e) => setMinRate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="maxRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Hourly Rate (₱)</label>
                <Input
                  id="maxRate"
                  type="number"
                  placeholder="e.g., 500"
                  value={maxRate}
                  onChange={(e) => setMaxRate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map((skill) => (
                <Button
                  key={skill}
                  variant={selectedSkills.includes(skill) ? "default" : "outline"}
                  onClick={() => handleSkillToggle(skill)}
                  className={cn(
                    selectedSkills.includes(skill) ? "bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white" : "border-[hsl(var(--border-color))] text-[hsl(var(--text-dark))] hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={handleResetFilters} variant="outline" className="border-gray-400 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
              <X size={18} className="mr-2" /> Reset Filters
            </Button>
            {/* The filtering happens automatically on state change, so an explicit "Apply" button is not strictly needed, but can be added for UX if desired */}
          </div>
        </div>

        {filteredTaskers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xl mb-4">
              No taskers found matching your criteria. Try adjusting your filters!
            </p>
            <Button onClick={() => navigate('/features-earnings')} className="bg-green-600 hover:bg-green-700 text-white">
              Become a Tasker
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTaskers.map((tasker) => (
              <Card key={tasker.userId} className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-[var(--border-radius)] overflow-hidden">
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
                  <Link to={`/taskers/${tasker.userId}`} className="w-full">
                    <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseTaskersPage;