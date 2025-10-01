import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTaskerProfile, TaskerProfile } from '@/hooks/use-tasker-profile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Mail, DollarSign, Briefcase, Calendar, MessageSquare, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { toast } from 'sonner'; // Import toast

const TaskerProfileViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); // Get current user info
  const { fetchTaskerProfileById, loading: globalLoading } = useTaskerProfile();
  const [tasker, setTasker] = useState<TaskerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasker = async () => {
      if (!id) {
        setError("Tasker ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const fetchedTasker = await fetchTaskerProfileById(id);
      if (fetchedTasker) {
        setTasker(fetchedTasker);
      } else {
        setError("Tasker not found.");
      }
      setLoading(false);
    };

    loadTasker();
  }, [id, fetchTaskerProfileById]);

  const handleContactTasker = () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to contact a tasker.");
      navigate('/profile'); // Or open login modal
      return;
    }
    if (user.uid === id) {
      toast.info("You cannot chat with yourself.");
      return;
    }
    navigate(`/chat/${id}`);
  };

  if (loading || globalLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading tasker profile...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500 pt-[80px]">Error: {error}</div>;
  }

  if (!tasker) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Tasker profile not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] px-4">
      <div className="container mx-auto max-w-3xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          &larr; Back to Taskers
        </Button>

        <Card className="shadow-lg p-6 mb-8">
          <CardContent className="flex flex-col items-center text-center p-0">
            <Avatar className="w-32 h-32 mb-4 border-4 border-green-500">
              <AvatarImage src={tasker.photoURL || undefined} alt={tasker.displayName} />
              <AvatarFallback className="bg-green-200 text-green-800 text-5xl font-semibold">
                {tasker.displayName ? tasker.displayName.charAt(0).toUpperCase() : <UserIcon size={48} />}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">{tasker.displayName}</h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-4">
              <Mail size={18} /> {tasker.userId} {/* Using userId as a placeholder for email/contact */}
            </p>

            <CardDescription className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-prose">
              {tasker.bio}
            </CardDescription>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-800 dark:text-gray-100">
                <DollarSign size={20} className="text-green-600" />
                <span className="font-semibold">Hourly Rate:</span> ₱{tasker.hourlyRate.toLocaleString()}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-800 dark:text-gray-100">
                <Calendar size={20} className="text-green-600" />
                <span className="font-semibold">Joined:</span> {new Date(tasker.dateJoined).toLocaleDateString()}
              </div>
            </div>

            <div className="w-full mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-center md:justify-start gap-2">
                <Briefcase size={20} /> Skills
              </h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {tasker.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={handleContactTasker} className="mt-6 bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2">
              <MessageSquare size={20} /> Contact Tasker
            </Button>
          </CardContent>
        </Card>

        {/* Placeholder for Reviews Section */}
        <Card className="shadow-lg p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Star size={24} /> Reviews & Ratings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-gray-600 dark:text-gray-400 italic">
              No reviews yet. Be the first to leave feedback!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              (This section will display client reviews and ratings in a future update.)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskerProfileViewPage;