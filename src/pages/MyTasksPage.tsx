"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useOffers } from '@/hooks/use-offers';
import { useChat } from '@/hooks/use-chat';
import Header from '@/components/Header';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Toaster } from '@/components/ui/sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TaskCard from '@/components/TaskCard';
import { MessageCircle } from 'lucide-react';
import { showError } from '@/utils/toast'; // Corrected import for showError

const MyTasksPage: React.FC = () => {
  const { user, isAuthenticated, signInWithGoogle, signOutUser, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { offers, loading: offersLoading, error: offersError } = useOffers();
  const { createOrGetChatRoom, selectChatRoom } = useChat();
  const navigate = useNavigate();

  const loading = authLoading || tasksLoading || offersLoading;
  const error = tasksError || offersError;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <p>Loading your tasks and offers...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pt-[80px]">
        <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
        <main className="container mx-auto p-4 text-center">
          <p className="text-red-500">Please sign in to view your tasks and offers.</p>
        </main>
        <MadeWithDyad />
        <Toaster />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pt-[80px]">
        <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
        <main className="container mx-auto p-4 text-center text-red-500">
          <p>Error loading data: {error}</p>
        </main>
        <MadeWithDyad />
        <Toaster />
      </div>
    );
  }

  const myPostedTasks = tasks.filter(task => task.posterId === user?.uid);
  const myMadeOffers = offers.filter(offer => offer.taskerId === user?.uid);

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

  const handleInitiateChatFromOffer = async (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    const task = tasks.find(t => t.id === offer?.taskId);

    if (!offer || !task || !user) {
      showError("Could not find offer or task details to start chat."); // Changed from toast.error to showError
      return;
    }

    const chatRoomId = await createOrGetChatRoom(
      [user.uid, task.posterId],
      [user.displayName || 'You', task.posterName],
      [user.photoURL || undefined, task.posterAvatar || undefined],
      task.id
    );

    if (chatRoomId) {
      selectChatRoom(chatRoomId);
      navigate('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
      <main className="flex-1 container mx-auto p-4 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">My Tasks & Offers</h1>

        {/* My Posted Tasks Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Tasks I Posted</CardTitle>
            <CardDescription>Tasks you have created and are looking to get done.</CardDescription>
          </CardHeader>
          <CardContent>
            {myPostedTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">You haven't posted any tasks yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myPostedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Offers Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Offers</CardTitle>
            <CardDescription>Offers you have made on tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            {myMadeOffers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">You haven't made any offers yet.</p>
            ) : (
              <div className="space-y-4">
                {myMadeOffers.map((offer) => {
                  const taskForOffer = tasks.find(task => task.id === offer.taskId);
                  return (
                    <Card key={offer.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <Link to={`/tasks/${offer.taskId}`} className="text-lg font-semibold text-blue-600 hover:underline">
                          Offer for: {taskForOffer?.title || 'Unknown Task'}
                        </Link>
                        <p className="text-gray-700 dark:text-gray-300">Your Offer: <span className="font-bold">₱{offer.offerAmount.toLocaleString()}</span></p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{offer.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Made on: {new Date(offer.dateCreated).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        {getOfferStatusBadge(offer.status)}
                        {offer.status === 'accepted' && taskForOffer && !taskForOffer.isDemo && (
                          <Button
                            onClick={() => handleInitiateChatFromOffer(offer.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 text-sm"
                          >
                            <MessageCircle size={16} /> Chat with Poster
                          </Button>
                        )}
                        {taskForOffer?.isDemo && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">Actions disabled for sample tasks.</p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <MadeWithDyad />
      <Toaster />
    </div>
  );
};

export default MyTasksPage;