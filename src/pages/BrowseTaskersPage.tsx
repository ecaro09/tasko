import React from 'react';
import { Button } from "@/components/ui/button";
import { Filter, Search, DollarSign, Briefcase, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const BrowseTaskersPage: React.FC = () => {
  const navigate = useNavigate();
  const { allTaskerProfiles, loading, error } = useTaskerProfile();

  if (loading) {
    return <div className="container mx-auto p-4 text-center pt-[80px] pb-[calc(var(--bottom-navigation-height)+var(--safe-area-bottom))] md:pb-12">Loading taskers...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500 pt-[80px] pb-[calc(var(--bottom-navigation-height)+var(--safe-area-bottom))] md:pb-12">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] pb-[calc(var(--bottom-navigation-height)+var(--safe-area-bottom))] md:pb-12">
      <div className="container mx-auto px-4">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          &larr; Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Browse Skilled Taskers</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center max-w-3xl mx-auto">
          Find the perfect professional for your task. Filter by skills, ratings, price, and location.
        </p>

        <div className="flex justify-center gap-4 mb-12">
          <Button variant="outline" className="flex items-center gap-2 border-gray-400 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Filter size={20} /> Filters (Coming Soon)
          </Button>
          <Button variant="outline" className="flex items-center gap-2 border-gray-400 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Search size={20} /> Search Taskers (Coming Soon)
          </Button>
        </div>

        {allTaskerProfiles.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 dark:text-gray-400 text-xl mb-4">
              No taskers registered yet. Be the first to sign up!
            </p>
            <Button onClick={() => navigate('/features-earnings')} className="bg-green-600 hover:bg-green-700 text-white">
              Become a Tasker
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTaskerProfiles.map((tasker) => (
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