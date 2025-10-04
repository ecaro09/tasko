import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { openTasks, assignedTasks, completedTasks } from './initial-tasks-data'; // Import individual task arrays

// Function to seed initial tasks
export const seedInitialTasks = async () => {
  const tasksCollectionRef = collection(db, 'tasks');
  const snapshot = await getDocs(tasksCollectionRef);

  if (snapshot.empty) {
    console.log("Database is empty, seeding initial tasks...");
    const allInitialTasks = [...openTasks, ...assignedTasks, ...completedTasks];
    for (const task of allInitialTasks) {
      await addDoc(tasksCollectionRef, task);
    }
    toast.info("Initial demo tasks added!");
  }
};