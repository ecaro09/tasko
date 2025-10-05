import React from 'react';
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface TaskerActionButtonsProps {
  canMarkInProgress: boolean;
  onMarkInProgress: () => void;
  canMarkCompleteAndReview: boolean;
  reviewRating: number[];
  setReviewRating: (value: number[]) => void;
  reviewComment: string;
  setReviewComment: (value: string) => void;
  onMarkCompleteAndReview: () => void;
}

const TaskerActionButtons: React.FC<TaskerActionButtonsProps> = ({
  canMarkInProgress,
  onMarkInProgress,
  canMarkCompleteAndReview,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  onMarkCompleteAndReview,
}) => {
  return (
    <>
      {canMarkInProgress && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-6">
              <Clock size={20} className="mr-2" /> Mark as In Progress
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark Task as In Progress?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark this task as "In Progress"? This indicates you have started working on the task.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onMarkInProgress} className="bg-orange-600 hover:bg-orange-700">
                Confirm In Progress
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {canMarkCompleteAndReview && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white mt-6">
              <CheckCircle size={20} className="mr-2" /> Mark as Complete & Review
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark Task as Complete & Review</AlertDialogTitle>
              <AlertDialogDescription>
                Please provide a rating and an optional comment for the client.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="rating" className="text-right">
                  Rating: {reviewRating[0]} Stars
                </Label>
                <Slider
                  id="rating"
                  min={1}
                  max={5}
                  step={1}
                  value={reviewRating}
                  onValueChange={setReviewRating}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="comment" className="text-right">
                  Comment (Optional)
                </Label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience with the client..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onMarkCompleteAndReview} className="bg-green-600 hover:bg-green-700">
                Submit Review & Complete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default TaskerActionButtons;