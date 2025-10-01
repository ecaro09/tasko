import React from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { showSuccess, showError } from '@/utils/toast';

interface FirestoreDataState {
  tasks: string[];
  notes: string[];
  loading: boolean;
  addTask: (task: string) => Promise<void>;
  addNote: (note: string) => Promise<void>;
}

export const useFirestoreData = (user: User | null): FirestoreDataState => {
  const [tasks, setTasks] = React.useState<string[]>([]);
  const [notes, setNotes] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      setTasks([]);
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const notesQuery = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const fetchedTasks: string[] = [];
      snapshot.forEach((doc) => {
        fetchedTasks.push(doc.data().content);
      });
      setTasks(fetchedTasks);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      showError("Failed to load tasks.");
      setLoading(false);
    });

    const unsubscribeNotes = onSnapshot(notesQuery, (snapshot) => {
      const fetchedNotes: string[] = [];
      snapshot.forEach((doc) => {
        fetchedNotes.push(doc.data().content);
      });
      setNotes(fetchedNotes);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notes:", error);
      showError("Failed to load notes.");
      setLoading(false);
    });

    return () => {
      unsubscribeTasks();
      unsubscribeNotes();
    };
  }, [user]);

  const addTask = async (task: string) => {
    if (!user) {
      showError('You must be signed in to add tasks.');
      return;
    }
    try {
      await addDoc(collection(db, 'tasks'), {
        userId: user.uid,
        content: task,
        createdAt: serverTimestamp(),
      });
      showSuccess('Task added successfully!');
    } catch (error: any) {
      console.error('Error adding task:', error);
      showError(`Failed to add task: ${error.message}`);
    }
  };

  const addNote = async (note: string) => {
    if (!user) {
      showError('You must be signed in to add notes.');
      return;
    }
    try {
      await addDoc(collection(db, 'notes'), {
        userId: user.uid,
        content: note,
        createdAt: serverTimestamp(),
      });
      showSuccess('Note added successfully!');
    } catch (error: any) {
      console.error('Error adding note:', error);
      showError(`Failed to add note: ${error.message}`);
    }
  };

  return {
    tasks,
    notes,
    loading,
    addTask,
    addNote,
  };
};