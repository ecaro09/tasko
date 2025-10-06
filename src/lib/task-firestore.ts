import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { User as FirebaseUser } from 'firebase/auth';

export interface Task {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  budget: number;
  posterId: string;
  posterName: string;
  posterAvatar: string;
  datePosted: string;
  status: 'open' | 'assigned' | 'completed';
  imageUrl?: string; // Made optional
  assignedTaskerId?: string;
  assignedOfferId?: string;
  rating?: number;
  review?: string;
}

export const addTaskFirestore = async (
  newTaskData: Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId' | 'rating' | 'review'> & { imageUrl?: string }, // Allow imageUrl
  user: FirebaseUser
) => {
  try {
    await addDoc(collection(db, 'tasks'), {
      ...newTaskData,
      posterId: user.uid,
      posterName: user.displayName || user.email || "Anonymous User",
      posterAvatar: user.photoURL || "https://randomuser.me/api/portraits/lego/1.jpg",
      datePosted: serverTimestamp(),
      status: 'open',
      imageUrl: newTaskData.imageUrl || "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Use provided image or default
    });
    toast.success("Task posted successfully!");
  } catch (err: any) {
    console.error("Error adding task:", err);
    toast.error(`Failed to post task: ${err.message}`);
    throw err;
  }
};

export const editTaskFirestore = async (
  taskId: string,
  updatedTask: Partial<Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted'>>,
  user: FirebaseUser
) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);
    if (!taskSnap.exists() || taskSnap.data()?.posterId !== user.uid) {
      toast.error("You are not authorized to edit this task.");
      return;
    }

    await updateDoc(taskRef, updatedTask);
    toast.success("Task updated successfully!");
  } catch (err: any) {
    console.error("Error updating task:", err);
    toast.error(`Failed to update task: ${err.message}`);
    throw err;
  }
};

export const deleteTaskFirestore = async (taskId: string, user: FirebaseUser) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);
    if (!taskSnap.exists() || taskSnap.data()?.posterId !== user.uid) {
      toast.error("You are not authorized to delete this task.");
      return;
    }

    await deleteDoc(taskRef);
    toast.success("Task deleted successfully!");
  } catch (err: any) {
    console.error("Error deleting task:", err);
    toast.error(`Failed to delete task: ${err.message}`);
    throw err;
  }
};

export const completeTaskWithReviewFirestore = async (
  taskId: string,
  rating: number,
  review: string,
  user: FirebaseUser
) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    // Optionally, verify if the current user is the poster or assigned tasker
    // For simplicity, we'll assume the calling context ensures authorization.
    await updateDoc(taskRef, {
      status: 'completed',
      rating: rating,
      review: review,
    });
    toast.success("Task marked as completed and reviewed!");
  } catch (err: any) {
    console.error("Error completing task with review:", err);
    toast.error(`Failed to complete task and add review: ${err.message}`);
    throw err;
  }
};