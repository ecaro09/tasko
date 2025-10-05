import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ReviewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmit: (rating: number, review: string) => Promise<void>;
  taskTitle: string;
}

const ReviewTaskModal: React.FC<ReviewTaskModalProps> = ({ isOpen, onClose, onReviewSubmit, taskTitle }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setRating(0);
      setReview('');
    }
  }, [isOpen]);

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please provide a star rating.");
      return;
    }
    if (review.trim() === '') {
      toast.error("Please write a review.");
      return;
    }

    setIsLoading(true);
    try {
      await onReviewSubmit(rating, review);
      onClose();
    } catch (error) {
      // Error handled by the parent function, toast already shown
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Review Task</DialogTitle>
          <DialogDescription className="text-[hsl(var(--text-light))]">
            Share your experience for "{taskTitle}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-lg font-semibold">Rating</Label>
            <div className="flex gap-1">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={32}
                  className={cn(
                    "cursor-pointer transition-colors",
                    index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
                  )}
                  onClick={() => handleStarClick(index)}
                  aria-label={`${index + 1} star rating`}
                />
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="review">Your Review</Label>
            <Textarea
              id="review"
              placeholder="How was your experience with the tasker?"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewTaskModal;