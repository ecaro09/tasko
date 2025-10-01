import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useOffers } from '@/hooks/use-offers';
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Tag, DollarSign, MessageSquare, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const MyOffersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { offers, loading: offersLoading, error: offersError, withdrawOffer } = useOffers();
  const { tasks, loading: tasksLoading } = useTasks();

  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = React.useState(false);
  const [offerToWithdraw, setOfferToWithdraw] = React.useState<string | null>(null);

  if (authLoading || offersLoading || tasksLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading your offers...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto p-4 text-center pt-[80px]">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">Please log in to view your offers.</p>
        <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
          Go to Home
        </Button>
      </div>
    );
  }

  const userOffers = offers.filter(offer => offer.taskerId === user.uid);

  const getOfferStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200">Rejected</Badge>;
      case 'withdrawn':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleWithdrawClick = (offerId: string) => {
    setOfferToWithdraw(offerId);
    setIsWithdrawDialogOpen(true);
  };

  const handleConfirmWithdraw = async () => {
    if (offerToWithdraw) {
      try {
        await withdrawOffer(offerToWithdraw);
      } catch (error) {
        // Error handled by useOffers hook, toast already shown
      } finally {
        setOfferToWithdraw(null);
        setIsWithdrawDialogOpen(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">My Offers</h1>

        {offersError && <p className="col-span-full text-center text-red-500 italic py-8">Error loading offers: {offersError}</p>}

        {userOffers.length === 0 && !offersLoading && !offersError ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">You haven't made any offers yet.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Browse Tasks
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userOffers.map((offer) => {
              const task = tasks.find(t => t.id === offer.taskId);
              if (!task) return null; // Don't render if task not found

              return (
                <Card key={offer.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="h-40 overflow-hidden relative">
                    <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-[hsl(var(--primary-color))] text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {task.category}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                    <p className="text-gray-600 flex items-center mb-2">
                      <MapPin size={16} className="mr-2" /> {task.location}
                    </p>
                    <p className="text-gray-600 flex items-center mb-2">
                      <DollarSign size={16} className="mr-2" /> Task Budget: ₱{task.budget.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-2xl font-bold text-green-600">Your Offer: ₱{offer.offerAmount.toLocaleString()}</p>
                      {getOfferStatusBadge(offer.status)}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                      <MessageSquare size={16} className="inline-block mr-1 align-text-bottom" /> {offer.message}
                    </p>
                    <div className="flex justify-between items-center">
                      <Link to={`/tasks/${task.id}`}>
                        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                          View Task
                        </Button>
                      </Link>
                      {offer.status === 'pending' && (
                        <Button
                          variant="destructive"
                          onClick={() => handleWithdrawClick(offer.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Withdraw Offer
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

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to withdraw this offer?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The client will be notified that your offer has been withdrawn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmWithdraw} className="bg-red-600 hover:bg-red-700 text-white">
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyOffersPage;