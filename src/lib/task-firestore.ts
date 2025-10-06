import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  DocumentData,
  Timestamp,
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
  dateCompleted?: string; // Added this property
}

const TASKS_CACHE_KEY = 'tasko_tasks_cache';

// Utility to save tasks to local storage
export const saveTasksToCache = (tasks: Task[]) => {
  try {
    localStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("Error saving tasks to local storage:", e);
  }
};

// Utility to load tasks from local storage
export const loadTasksFromCache = (): Task[] => {
  try {
    const cachedData = localStorage.getItem(TASKS_CACHE_KEY);
    return cachedData ? JSON.parse(cachedData) : [];
  } catch (e) {
    console.error("Error loading tasks from local storage:", e);
    return [];
  }
};

export const addTaskFirestore = async (
  newTaskData: Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId' | 'rating' | 'review' | 'dateCompleted'> & { imageUrl?: string }, // Allow imageUrl
  user: FirebaseUser
) => {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...newTaskData,
      posterId: user.uid,
      posterName: user.displayName || user.email || "Anonymous User",
      posterAvatar: user.photoURL || "https://randomuser.me/api/portraits/lego/1.jpg",
      datePosted: serverTimestamp(),
      status: 'open',
      imageUrl: newTaskData.imageUrl || "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Use provided image or default
    });
    toast.success("Task posted successfully!");

    // Update cache
    const newTask: Task = {
      id: docRef.id,
      ...newTaskData,
      posterId: user.uid,
      posterName: user.displayName || user.email || "Anonymous User",
      posterAvatar: user.photoURL || "https://randomuser.me/api/portraits/lego/1.jpg",
      datePosted: new Date().toISOString(), // Use current date for immediate cache update
      status: 'open',
      imageUrl: newTaskData.imageUrl || "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    };
    const currentTasks = loadTasksFromCache();
    saveTasksToCache([newTask, ...currentTasks]);

  } catch (err: any) {
    console.error("Error adding task:", err);
    toast.error(`Failed to post task: ${err.message}`);
    throw err;
  }
};

export const editTaskFirestore = async (
  taskId: string,
  updatedTask: Partial<Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'dateCompleted'>>,
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

    // Update cache
    const currentTasks = loadTasksFromCache();
    const updatedTasks = currentTasks.map(task =>
      task.id === taskId ? { ...task, ...updatedTask, dateUpdated: new Date().toISOString() } : task
    );
    saveTasksToCache(updatedTasks);

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

    // Update cache
    const currentTasks = loadTasksFromCache();
    const updatedTasks = currentTasks.filter(task => task.id !== taskId);
    saveTasksToCache(updatedTasks);

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
      dateCompleted: serverTimestamp(), // Add dateCompleted
    });
    toast.success("Task marked as completed and reviewed!");

    // Update cache
    const currentTasks = loadTasksFromCache();
    const updatedTasks = currentTasks.map(task =>
      task.id === taskId ? { ...task, status: 'completed', rating, review, dateCompleted: new Date().toISOString() } : task
    );
    saveTasksToCache(updatedTasks);

  } catch (err: any) {
    console.error("Error completing task with review:", err);
    toast.error(`Failed to complete task and add review: ${err.message}`);
    throw err;
  }
};

export const fetchTasksFirestore = (
  onTasksFetched: (tasks: Task[]) => void,
  onError: (error: string) => void
) => {
  const tasksCollectionRef = collection(db, 'tasks');
  const q = query(tasksCollectionRef, orderBy('datePosted', 'desc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedTasks: Task[] = snapshot.docs.map((doc) => {
      const data = doc.data() as DocumentData;
      
      let datePostedDate: Date;
      if (data.datePosted instanceof Timestamp) {
        datePostedDate = data.datePosted.toDate();
      } else if (typeof data.datePosted === 'string') {
        datePostedDate = new Date(data.datePosted);
      } else {
        datePostedDate = new Date();
      }

      let dateCompletedDate: Date | undefined;
      if (data.dateCompleted instanceof Timestamp) {
        dateCompletedDate = data.dateCompleted.toDate();
      } else if (typeof data.dateCompleted === 'string') {
        dateCompletedDate = new Date(data.dateCompleted);
      }

      return {
        id: doc.id,
        title: data.title,
        category: data.category,
        description: data.description,
        location: data.location,
        budget: data.budget,
        posterId: data.posterId,
        posterName: data.posterName,
        posterAvatar: data.posterAvatar || "https://randomuser.me/api/portraits/lego/1.jpg",
        datePosted: datePostedDate.toISOString(),
        status: data.status || 'open',
        imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        assignedTaskerId: data.assignedTaskerId || undefined,
        assignedOfferId: data.assignedOfferId || undefined,
        rating: data.rating || undefined,
        review: data.review || undefined,
        dateCompleted: dateCompletedDate?.toISOString() || undefined,
      };
    });
    onTasksFetched(fetchedTasks);
    saveTasksToCache(fetchedTasks); // Update cache with fresh data
  }, (err) => {
    console.error("Error fetching tasks:", err);
    onError("Failed to fetch tasks.");
    toast.error("Failed to load tasks.");
  });

  return unsubscribe;
};