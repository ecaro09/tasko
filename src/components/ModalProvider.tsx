import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useOffers } from '@/hooks/use-offers';
import { Task } from '@/hooks/use-tasks';
import CreateTaskModal from './CreateTaskModal'; // Import the new modal component

interface ModalContextType {
  openMakeOfferModal: (task: Task) => void;
  openCreateTaskModal: () => void; // New function to open CreateTaskModal
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { makeOffer, loading: offersLoading } = useOffers();
  const [isMakeOfferModalOpen, setIsMakeOfferModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false); // New state for CreateTaskModal
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [offerAmount, setOfferAmount] = useState<string>('');
  const [offerMessage, setOfferMessage] = useState<string>('');

  const openMakeOfferModal = (task: Task) => {
    setCurrentTask(task);
    setOfferAmount('');
    setOfferMessage('');
    setIsMakeOfferModalOpen(true);
  };

  const openCreateTaskModal = () => { // New function implementation
    setIsCreateTaskModalOpen(true);
  };

  const closeModal = () => {
    setIsMakeOfferModalOpen(false);
    setIsCreateTaskModalOpen(false); // Close CreateTaskModal as well
    setCurrentTask(null);
  };

  const handleSubmitOffer = async () => {
    if (!currentTask) return;

    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid offer amount.");
      return;
    }
    if (!offerMessage.trim()) {
      toast.error("Please enter a message for your offer.");
      return;
    }

    try {
      await makeOffer(currentTask.id, amount, offerMessage);
      toast.success("Your offer has been submitted!");
      closeModal();
    } catch (error) {
      console.error("Failed to submit offer:", error);
      toast.error("Failed to submit offer. Please try again.");
    }
  };

  return (
    <ModalContext.Provider value={{ openMakeOfferModal, openCreateTaskModal, closeModal }}>
      {children}

      {/* Make Offer Modal */}
      <Dialog open={isMakeOfferModalOpen} onOpenChange={setIsMakeOfferModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Make an Offer for "{currentTask?.title}"</DialogTitle>
            <DialogDescription>
              Submit your offer amount and a message to the task poster.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="offerAmount" className="text-right">
                Offer Amount (₱)
              </Label>
              <Input
                id="offerAmount"
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="col-span-3"
                min="0"
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="offerMessage" className="text-right">
                Message
              </Label>
              <Textarea
                id="offerMessage"
                placeholder="Tell the task poster why you're the best fit..."
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSubmitOffer} disabled={offersLoading}>
              {offersLoading ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Modal */}
      <CreateTaskModal isOpen={isCreateTaskModalOpen} onClose={closeModal} />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};