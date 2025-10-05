import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MessageSquare, User, CheckCircle, XCircle } from 'lucide-react'; // Added CheckCircle and XCircle
import { toast } from 'sonner';
import { Task } from '@/hooks/use-tasks';
import { Offer } from '@/hooks/use-offers';
import { DEFAULT_AVATAR_URL } from '@/utils/image-placeholders';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components
import { Badge } from "@/components/ui/badge"; // Import Badge component

interface TaskOffersSectionProps {
  task: Task;
  offers: Offer[];
  userOffer: Offer | null;
  canMakeOffer: boolean;
  canEditOffer: boolean;
  canDeleteOffer: boolean;
  canAcceptRejectOffers: boolean;
  offerAmount: number[];
  setOfferAmount: (value: number[]) => void;
  offerMessage: string;
  setOfferMessage: (value: string) => void;
  onCreateOffer: () => void;
  onAcceptOffer: (offerId: string, taskerId: string) => void;
  onRejectOffer: (offerId: string) => void;
  onWithdrawOffer: (offerId: string) => void;
  onChatWithUser: (userId: string) => void;
}

const TaskOffersSection: React.FC<TaskOffersSectionProps> = ({
  task,
  offers,
  userOffer,
  canMakeOffer,
  canEditOffer,
  canDeleteOffer,
  canAcceptRejectOffers,
  offerAmount,
  setOfferAmount,
  offerMessage,
  setOfferMessage,
  onCreateOffer,
  onAcceptOffer,
  onRejectOffer,
  onWithdrawOffer,
  onChatWithUser,
}) => {
  const isTaskOpen = task.status === 'open';
  const isTaskAssigned = task.status === 'assigned';
  const isTaskInProgress = task.status === 'in_progress';
  const isTaskCompleted = task.status === 'completed';
  const isTaskCancelled = task.status === 'cancelled';

  const pendingOffers = offers.filter(o => o.taskId === task.id && o.status === 'pending');
  const acceptedOffer = offers.find(o => o.taskId === task.id && o.status === 'accepted');

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
    <Card className="bg-white dark:bg-gray-800 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-green-600">Offers</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Section for making an offer (if applicable) */}
        {isTaskOpen && canMakeOffer && (
          <div className="mb-6 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h4 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-300">Make an Offer</h4>
            <div className="mb-3">
              <Label htmlFor="offer-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Offer Amount: ₱{offerAmount[0].toLocaleString()}
              </Label>
              <Slider
                id="offer-amount"
                min={100}
                max={task.budget * 2}
                step={50}
                value={offerAmount}
                onValueChange={setOfferAmount}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="offer-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message to Client
              </Label>
              <Textarea
                id="offer-message"
                placeholder="Tell the client why you're the best fit for this task..."
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={onCreateOffer} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Submit Offer
            </Button>
          </div>
        )}

        {/* Section for tasker's pending offer (if applicable) */}
        {isTaskOpen && userOffer && userOffer.status === 'pending' && (canEditOffer || canDeleteOffer) && (
          <div className="mb-6 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <h4 className="text-lg font-semibold mb-3 text-yellow-700 dark:text-yellow-300">Your Pending Offer</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <span className="font-semibold">Amount:</span> ₱{userOffer.offerAmount.toLocaleString()}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <span className="font-semibold">Message:</span> {userOffer.message}
            </p>
            <div className="flex gap-2">
              {canEditOffer && (
                <Button
                  onClick={() => toast.info("Editing offers is not yet implemented.")}
                  variant="outline"
                  className="flex-1 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
                >
                  Edit Offer
                </Button>
              )}
              {canDeleteOffer && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      Delete Offer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete your offer?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Your offer will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onWithdrawOffer(userOffer.id)} className="bg-red-600 hover:bg-red-700">
                        Yes, delete offer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        )}

        {/* Display for when no offers are present or client cannot make/accept offers */}
        {isTaskOpen && pendingOffers.length === 0 && !canMakeOffer && !userOffer && !canAcceptRejectOffers && (
          <p className="text-center text-gray-500 dark:text-gray-400 italic">No offers yet.</p>
        )}

        {/* Section for client to accept/reject offers */}
        {isTaskOpen && canAcceptRejectOffers && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Pending Offers ({pendingOffers.length})</h4>
            {pendingOffers.length > 0 ? (
              <div className="space-y-4">
                {pendingOffers.map(offer => (
                  <Card key={offer.id} className="p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600">
                        <AvatarImage
                          src={offer.taskerAvatar || DEFAULT_AVATAR_URL}
                          alt={offer.taskerName}
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_AVATAR_URL;
                            e.currentTarget.onerror = null;
                          }}
                        />
                        <AvatarFallback className="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {offer.taskerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{offer.taskerName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Offer: ₱{offer.offerAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 italic">"{offer.message}"</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => onAcceptOffer(offer.id, offer.taskerId)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle size={16} className="mr-2" /> Accept
                      </Button>
                      <Button
                        onClick={() => onRejectOffer(offer.id)}
                        variant="outline"
                        className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <XCircle size={16} className="mr-2" /> Reject
                      </Button>
                    </div>
                    <Button
                      onClick={() => onChatWithUser(offer.taskerId)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 mt-2"
                    >
                      <MessageSquare size={20} /> Chat with Tasker
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 italic">No pending offers.</p>
            )}
          </div>
        )}

        {/* Status displays for assigned, in progress, completed, cancelled */}
        {isTaskAssigned && (
          <div className="mt-6 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-center">
            <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">Task Assigned!</p>
            {acceptedOffer && (
              <p className="text-gray-700 dark:text-gray-300">
                Assigned to <span className="font-semibold">{acceptedOffer.taskerName}</span>. Waiting for tasker to mark as "In Progress".
              </p>
            )}
          </div>
        )}

        {isTaskInProgress && (
          <div className="mt-6 p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-center">
            <p className="text-lg font-semibold text-orange-700 dark:text-orange-300">Task In Progress!</p>
            <p className="text-gray-700 dark:text-gray-300">Tasker is currently working on this task.</p>
          </div>
        )}

        {isTaskCompleted && (
          <div className="mt-6 p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-center">
            <p className="text-lg font-semibold text-green-700 dark:text-green-300">Task Completed!</p>
            <p className="text-gray-700 dark:text-gray-300">This task has been successfully completed.</p>
          </div>
        )}

        {isTaskCancelled && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-center">
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Task Cancelled</p>
            <p className="text-gray-700 dark:text-gray-300">This task was cancelled by the client.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskOffersSection;