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
import { Task } from '@/hooks/use-tasks'; // Import Task interface
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer"; // Import Drawer components

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null; // The task for which the offer is being made
}

const MakeOfferModal: React.FC<MakeOfferModalProps> = ({ isOpen, onClose, task }) => {
  const { isAuthenticated, user } = useAuth();
  const { isTasker, loading: taskerProfileLoading } = useTaskerProfile();
  const { addOffer, loading: offersLoading } = useOffers();

  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile(); // Use the hook

  useEffect(() => {
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
      await addOffer(task.id, task.posterId, amount, message);
      onClose();
    } catch (error) {
      // Error handled by useOffers hook, toast already shown
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || taskerProfileLoading || offersLoading;

  const ModalComponent = isMobile ? Drawer : Dialog;
  const ModalContentComponent = isMobile ? DrawerContent : DialogContent;
  const ModalHeaderComponent = isMobile ? DrawerHeader : DialogHeader;
  const ModalTitleComponent = isMobile ? DrawerTitle : DialogTitle;
  const ModalDescriptionComponent = isMobile ? DrawerDescription : DialogDescription;
  const ModalFooterComponent = isMobile ? DrawerFooter : DialogFooter;

  return (
    <ModalComponent open={isOpen} onOpenChange={onClose}>
      <ModalContentComponent className="sm:max-w-[500px]">
        <ModalHeaderComponent>
          <ModalTitleComponent className="text-2xl font-bold text-[hsl(var(--primary-color))]">Make an Offer</ModalTitleComponent>
          <ModalDescriptionComponent className="text-[hsl(var(--text-light))]">
            Submit your offer for "{task?.title || 'this task'}".
          </ModalDescriptionComponent>
        </ModalHeaderComponent>
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
        <ModalFooterComponent>
          <Button variant="outline" onClick={onClose} disabled={isFormDisabled}>Cancel</Button>
          <Button onClick={handleMakeOffer} disabled={isFormDisabled} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
            {isLoading ? 'Submitting...' : 'Submit Offer'}
          </Button>
        </ModalFooterComponent>
      </ModalContentComponent>
    </ModalComponent>
  );
};

export default MakeOfferModal;