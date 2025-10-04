import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { initialTasks } from './initial-tasks-data'; // Import the initial tasks data

// Function to seed initial tasks
export const seedInitialTasks = async () => {
  const tasksCollectionRef = collection(db, 'tasks');
  const snapshot = await getDocs(tasksCollectionRef);

  if (snapshot.empty) {
    console.log("Database is empty, seeding initial tasks...");
    for (const task of initialTasks) {
      await addDoc(tasksCollectionRef, task);
    }
    toast.info("Initial demo tasks added!");
  }
};