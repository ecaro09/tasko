import React from 'react';
import { Button } from "@/components/ui/button";
import { XCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ClientActionButtonsProps {
  canCancelTask: boolean;
  onCancelTask: () => void;
}

const ClientActionButtons: React.FC<ClientActionButtonsProps> = ({
  canCancelTask,
  onCancelTask,
}) => {
  return (
    <>
      {canCancelTask && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full mt-4">
              <XCircle size={20} className="mr-2" /> Cancel Task
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently cancel your task and notify any assigned tasker.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onCancelTask} className="bg-red-600 hover:bg-red-700">
                Yes, cancel task
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default ClientActionButtons;