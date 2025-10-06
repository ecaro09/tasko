import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { useOffers } from '@/hooks/use-offers';
import { toast } from 'sonner';
import { Task } from '@/lib/task-firestore'; // Import Task interface from new location

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null; // The task for which the offer is being made
}

const MakeOfferModal: React.FC<MakeOfferModalProps> = ({ isOpen, onClose, task }) => {
  const { isAuthenticated, user } = useAuth();
  const { isTasker, loading: taskerProfileLoading } = useTaskerProfile();
  const { addOffer, loading: offersLoading } = useOffers();

  const [offerAmount, setOfferAmount] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setOfferAmount('');
      setMessage('');
    }
  }, [isOpen]);

  const handleMakeOffer = async () => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to make an offer.");
      return;
    }
    if (!isTasker) {
      toast.error("You must be registered as a tasker to make an offer.");
      return;
    }
    if (!task) {
      toast.error("No task selected to make an offer on.");
      return;
    }
    if (!offerAmount || !message.trim()) {
      toast.error("Please enter an offer amount and a message.");
      return;
    }
    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Offer amount must be a positive number.");
      return;
    }

    setIsLoading(true);
    try {
      await addOffer({
        taskId: task.id,
        clientId: task.posterId, // Client ID is the task poster's ID
        amount: amount,
        message: message,
      });
      onClose();
    } catch (error) {
      // Error handled by useOffers hook, toast already shown
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || taskerProfileLoading || offersLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Make an Offer</DialogTitle>
          <DialogDescription className="text-[hsl(var(--text-light))]">
            Submit your offer for "{task?.title || 'this task'}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="offerAmount" className="text-right">
              Your Offer (₱)
            </Label>
            <Input
              id="offerAmount"
              type="number"
              placeholder="e.g., 1200"
              className="col-span-3"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="message" className="text-right pt-2">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Tell the client why you're the best tasker for this job..."
              className="col-span-3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isFormDisabled}>Cancel</Button>
          <Button onClick={handleMakeOffer} disabled={isFormDisabled} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
            {isLoading ? 'Submitting...' : 'Submit Offer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MakeOfferModal;