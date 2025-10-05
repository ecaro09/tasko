import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useOffers, Offer } from '@/hooks/use-offers';
import { useTasks } from '@/hooks/use-tasks'; // To get task details for each offer
import { useTaskerProfile } from '@/hooks/use-tasker-profile'; // To check if user is a tasker
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tag, DollarSign, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';

const MyOffersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isTasker, loading: taskerProfileLoading } = useTaskerProfile();
  const { offers, loading: offersLoading, withdrawOffer } = useOffers();
  const { tasks, loading: tasksLoading } = useTasks();

  const isLoading = authLoading || taskerProfileLoading || offersLoading || tasksLoading;

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading your offers...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your offers.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTasker) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Not a Tasker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be registered as a tasker to view your offers.</p>
            <Button onClick={() => navigate('/features-earnings')} className="bg-green-600 hover:bg-green-700 text-white">
              Become a Tasker
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const myOffers = offers.filter(offer => offer.taskerId === user.id);

  const handleWithdrawOffer = async (offerId: string) => {
    try {
      await withdrawOffer(offerId);
    } catch (error) {
      // Error handled by useOffers hook
    }
  };

  const getOfferStatusBadge = (status: Offer['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200">Rejected</Badge>;
      case 'withdrawn':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">My Offers</h1>

        {myOffers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">You haven't made any offers yet.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Browse Tasks
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myOffers.map(offer => {
              const task = tasks.find(t => t.id === offer.taskId);
              if (!task) return null; // Don't render if task details are not found

              return (
                <Card key={offer.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{task.title}</h3>
                      {getOfferStatusBadge(offer.status)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center mb-2">
                      <Tag size={16} className="mr-2" /> {task.category}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 flex items-center mb-2">
                      <MessageSquare size={16} className="mr-2" /> {offer.message}
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
                      <DollarSign size={20} className="mr-2" /> ₱{offer.offerAmount.toLocaleString()}
                    </p>
                    <div className="flex justify-between items-center">
                      <Link to={`/tasks/${task.id}`}>
                        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                          View Task
                        </Button>
                      </Link>
                      {offer.status === 'pending' && (
                        <Button
                          variant="outline"
                          className="border-gray-400 text-gray-700 hover:bg-gray-100"
                          onClick={() => handleWithdrawOffer(offer.id)}
                        >
                          <Clock size={16} className="mr-2" /> Withdraw Offer
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOffersPage;