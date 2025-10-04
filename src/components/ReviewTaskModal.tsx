import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from 'lucide-react';
import { useTasks, Task } from '@/hooks/use-tasks';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReviewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

const ReviewTaskModal: React.FC<ReviewTaskModalProps> = ({ isOpen, onClose, task }) => {
  const { completeTaskWithReview } = useTasks();
  const [rating, setRating] = React.useState(0);
  const [review, setReview] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && task) {
      setRating(task.rating || 0);
      setReview(task.review || '');
    } else {
      setRating(0);
      setReview('');
    }
  }, [isOpen, task]);

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  const handleSubmitReview = async () => {
    if (!task) {
      toast.error("No task selected for review.");
      return;
    }
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
      await completeTaskWithReview(task.id, rating, review);
      onClose();
    } catch (error) {
      // Error handled by useTasks hook
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
            Rate and review "{task?.title || 'this task'}" to mark it as complete.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-lg font-semibold">Your Rating</Label>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={32}
                  className={cn(
                    "cursor-pointer transition-colors",
                    i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
                  )}
                  onClick={() => handleStarClick(i)}
                  aria-label={`Rate ${i + 1} stars`}
                />
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="review" className="text-lg font-semibold">Your Review</Label>
            <Textarea
              id="review"
              placeholder="Share your experience with the tasker..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmitReview} disabled={isLoading} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
            {isLoading ? 'Submitting...' : 'Submit Review & Complete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewTaskModal;