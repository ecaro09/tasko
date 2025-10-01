"use client";

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { useAuth } from './use-auth';
import { showSuccess, showError } from '@/utils/toast';

interface FirestoreDataItem {
  id: string;
  content: string;
  createdAt: number;
}

export const useFirestoreData = () => {
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<FirestoreDataItem[]>([]);
  const [notes, setNotes] = useState<FirestoreDataItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setTasks([]);
      setLoadingTasks(false);
      return;
    }

    setLoadingTasks(true);
    setError(null);

    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTasks: FirestoreDataItem[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            content: data.content,
            createdAt: data.createdAt?.toMillis() || Date.now(),
          };
        });
        setTasks(fetchedTasks);
        setLoadingTasks(false);
      },
      (err) => {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks.");
        setLoadingTasks(false);
        showError("Failed to load tasks.");
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  // Fetch notes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setNotes([]);
      setLoadingNotes(false);
      return;
    }

    setLoadingNotes(true);
    setError(null);

    const notesRef = collection(db, 'notes');
    const q = query(
      notesRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedNotes: FirestoreDataItem[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            content: data.content,
            createdAt: data.createdAt?.toMillis() || Date.now(),
          };
        });
        setNotes(fetchedNotes);
        setLoadingNotes(false);
      },
      (err) => {
        console.error("Error fetching notes:", err);
        setError("Failed to load notes.");
        setLoadingNotes(false);
        showError("Failed to load notes.");
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  const addTask = useCallback(async (content: string) => {
    if (!isAuthenticated || !user) {
      showError("You must be logged in to add tasks.");
      return;
    }
    try {
      await addDoc(collection(db, 'tasks'), {
        userId: user.uid,
        content,
        createdAt: serverTimestamp(),
      });
      showSuccess("Task added!");
    } catch (err) {
      console.error("Error adding task:", err);
      showError("Failed to add task.");
    }
  }, [isAuthenticated, user]);

  const addNote = useCallback(async (content: string) => {
    if (!isAuthenticated || !user) {
      showError("You must be logged in to add notes.");
      return;
    }
    try {
      await addDoc(collection(db, 'notes'), {
        userId: user.uid,
        content,
        createdAt: serverTimestamp(),
      });
      showSuccess("Note added!");
    } catch (err) {
      console.error("Error adding note:", err);
      showError("Failed to add note.");
    }
  }, [isAuthenticated, user]);

  const deleteTask = useCallback(async (id: string) => {
    if (!isAuthenticated || !user) {
      showError("You must be logged in to delete tasks.");
      return;
    }
    try {
      await deleteDoc(doc(db, 'tasks', id));
      showSuccess("Task deleted!");
    } catch (err) {
      console.error("Error deleting task:", err);
      showError("Failed to delete task.");
    }
  }, [isAuthenticated, user]);

  const deleteNote = useCallback(async (id: string) => {
    if (!isAuthenticated || !user) {
      showError("You must be logged in to delete notes.");
      return;
    }
    try {
      await deleteDoc(doc(db, 'notes', id));
      showSuccess("Note deleted!");
    } catch (err) {
      console.error("Error deleting note:", err);
      showError("Failed to delete note.");
    }
  }, [isAuthenticated, user]);

  return {
    tasks,
    notes,
    addTask,
    addNote,
    deleteTask,
    deleteNote,
    loadingTasks,
    loadingNotes,
    error,
  };
};