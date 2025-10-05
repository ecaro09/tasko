import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User as UserIcon, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TaskerProfile } from '@/lib/tasker-profile-firestore'; // Import TaskerProfile interface
import { useNavigate } from 'react-router-dom';

interface TopTaskersSectionProps {
  taskers: TaskerProfile[];
  loading: boolean;
}

const TopTaskersSection: React.FC<TopTaskersSectionProps> = ({ taskers, loading }) => {
  const navigate = useNavigate();

  return (
    <section id="top-taskers" className="py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg my-8 p-6">
      <h2 className="text-4xl font-bold text-[hsl(var(--primary-color))] mb-8 text-center">⭐ Top Taskers</h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-md rounded-[var(--border-radius)]">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Skeleton className="w-20 h-20 rounded-full mb-3" />
                <Skeleton className="h-6 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3 mb-3" />
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-10 w-32 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : taskers.length === 0 ? (
        <p className="text-center text-gray-500 italic py-8">No top taskers available yet. Be the first to register!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {taskers.map((tasker) => (
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
  );
};

export default TopTaskersSection;