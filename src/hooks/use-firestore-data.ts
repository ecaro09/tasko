import React from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, CollectionReference, DocumentData } from 'firebase/firestore';
import { showSuccess, showError } from '@/utils/toast';

interface FirestoreDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useFirestoreData<T extends DocumentData>(collectionName: string, userId: string | undefined) {
  const [state, setState] = React.useState<FirestoreDataState<T>>({
    data: [],
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    if (!userId) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    const q = query(collection(db, collectionName) as CollectionReference<T>, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === userId) { // Filter by userId
          items.push({ id: doc.id, ...data } as T);
        }
      });
      setState({ data: items, loading: false, error: null });
    }, (error) => {
      console.error(`Error fetching ${collectionName}:`, error);
      setState({ data: [], loading: false, error: `Failed to fetch ${collectionName}.` });
      showError(`Failed to load ${collectionName}.`);
    });

    return () => unsubscribe();
  }, [collectionName, userId]);

  const addItem = async (item: Omit<T, 'id' | 'createdAt' | 'userId'>) => {
    if (!userId) {
      showError("You must be signed in to add items.");
      return;
    }
    try {
      await addDoc(collection(db, collectionName), {
        ...item,
        userId,
        createdAt: serverTimestamp(),
      });
      showSuccess(`Added new ${collectionName.slice(0, -1)}!`);
    } catch (error: any) {
      console.error(`Error adding ${collectionName.slice(0, -1)}:`, error);
      showError(`Failed to add ${collectionName.slice(0, -1)}: ${error.message}`);
    }
  };

  return { ...state, addItem };
}