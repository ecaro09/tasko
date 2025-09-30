import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Task, Bid, User, Review, EarningsSummary } from './types';

// Task operations
export async function getTasks(filters?: {
  category?: string;
  status?: string;
  userId?: string;
  limit?: number;
}): Promise<Task[]> {
  let q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  
  if (filters?.category) {
    q = query(q, where('category', '==', filters.category));
  }
  
  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  
  if (filters?.userId) {
    q = query(q, where('clientId', '==', filters.userId));
  }
  
  if (filters?.limit) {
    q = query(q, limit(filters.limit));
  }
  
  const snapshot = await getDocs(q);
  const tasks: Task[] = [];
  
  for (const docSnap of snapshot.docs) {
    const taskData = docSnap.data();
    
    // Fetch client data
    const clientDoc = await getDoc(doc(db, 'users', taskData.clientId));
    const client = clientDoc.exists() ? clientDoc.data() : null;
    
    // Fetch tasker data if exists
    let tasker = null;
    if (taskData.taskerId) {
      const taskerDoc = await getDoc(doc(db, 'users', taskData.taskerId));
      tasker = taskerDoc.exists() ? taskerDoc.data() : null;
    }
    
    tasks.push({
      id: docSnap.id,
      ...taskData,
      client: client as User,
      tasker: tasker as User,
    } as Task);
  }
  
  return tasks;
}

export async function getTaskById(id: string): Promise<Task | null> {
  const docRef = doc(db, 'tasks', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const taskData = docSnap.data();
  
  // Fetch client data
  const clientDoc = await getDoc(doc(db, 'users', taskData.clientId));
  const client = clientDoc.exists() ? clientDoc.data() : null;
  
  // Fetch tasker data if exists
  let tasker = null;
  if (taskData.taskerId) {
    const taskerDoc = await getDoc(doc(db, 'users', taskData.taskerId));
    tasker = taskerDoc.exists() ? taskerDoc.data() : null;
  }
  
  return {
    id: docSnap.id,
    ...taskData,
    client: client as User,
    tasker: tasker as User,
  } as Task;
}

export async function createTask(taskData: Omit<Task, 'id' | 'client' | 'tasker'>): Promise<{ success: boolean; error?: string; taskId?: string }> {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, taskId: docRef.id };
  } catch (error: any) {
    console.error("Error creating task:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const docRef = doc(db, 'tasks', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Bid operations
export async function getBidsForTask(taskId: string): Promise<Bid[]> {
  const q = query(
    collection(db, 'tasks', taskId, 'bids'),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  const bids: Bid[] = [];
  
  for (const docSnap of snapshot.docs) {
    const bidData = docSnap.data();
    
    // Fetch tasker data
    const taskerDoc = await getDoc(doc(db, 'users', bidData.taskerId));
    const tasker = taskerDoc.exists() ? taskerDoc.data() : null;
    
    bids.push({
      id: docSnap.id,
      ...bidData,
      tasker: tasker as User,
    } as Bid);
  }
  
  return bids;
}

export async function createBid(taskId: string, bidData: Omit<Bid, 'id' | 'tasker'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'tasks', taskId, 'bids'), {
    ...bidData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// User operations
export async function getUserById(id: string): Promise<User | null> {
  const docRef = doc(db, 'users', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as User;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
  const docRef = doc(db, 'users', id);
  await updateDoc(docRef, updates);
}

// Earnings operations
export async function getEarningsSummary(periodId: string): Promise<EarningsSummary | null> {
  const docRef = doc(db, 'earnings_summary', periodId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as EarningsSummary;
}