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
import { saveOffersToCache, loadOffersFromCache } from './offer-local-cache'; // Import caching utilities
import { loadTasksFromCache, saveTasksToCache } from './task-local-cache'; // Import task caching utilities
import { Task } from './task-firestore'; // Import Task interface

export interface Offer {
  id: string;
  taskId: string;
  taskerId: string;
  taskerName: string;
  taskerAvatar: string;
  clientId: string; // Added clientId
  amount: number;
  message: string;
  dateOffered: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
}

export const addOfferFirestore = async (
  newOfferData: Omit<Offer, 'id' | 'taskerId' | 'taskerName' | 'taskerAvatar' | 'dateOffered' | 'status'>,
  user: FirebaseUser
) => {
  try {
    const docRef = await addDoc(collection(db, 'offers'), {
      ...newOfferData,
      taskerId: user.uid,
      taskerName: user.displayName || user.email || "Anonymous Tasker",
      taskerAvatar: user.photoURL || "https://randomuser.me/api/portraits/lego/2.jpg",
      dateOffered: serverTimestamp(),
      status: 'pending',
    });
    toast.success("Offer submitted successfully!");

    // Optimistically update local cache
    const newOffer: Offer = {
      id: docRef.id,
      ...newOfferData,
      taskerId: user.uid,
      taskerName: user.displayName || user.email || "Anonymous Tasker",
      taskerAvatar: user.photoURL || "https://randomuser.me/api/portraits/lego/2.jpg",
      dateOffered: new Date().toISOString(), // Use current date for optimistic update
      status: 'pending',
    };
    const currentOffers = loadOffersFromCache();
    saveOffersToCache([newOffer, ...currentOffers]);

  } catch (err: any) {
    console.error("Error adding offer:", err);
    toast.error(`Failed to submit offer: ${err.message}`);
    throw err;
  }
};

export const updateOfferFirestore = async (
  offerId: string,
  updatedOffer: Partial<Omit<Offer, 'id' | 'taskId' | 'taskerId' | 'taskerName' | 'taskerAvatar' | 'dateOffered'>>,
  user: FirebaseUser
) => {
  try {
    const offerRef = doc(db, 'offers', offerId);
    const offerSnap = await getDoc(offerRef);

    if (!offerSnap.exists()) {
      toast.error("Offer not found.");
      return;
    }

    const offerData = offerSnap.data() as Offer;
    // Allow tasker to update their own offer (e.g., withdraw)
    // Allow client (task poster) to update offer status (accept/reject)
    if (offerData.taskerId !== user.uid && offerData.clientId !== user.uid) {
      toast.error("You are not authorized to update this offer.");
      return;
    }

    await updateDoc(offerRef, updatedOffer);
    toast.success("Offer updated successfully!");

    // Optimistically update local cache
    const currentOffers = loadOffersFromCache();
    const updatedOffers = currentOffers.map(offer =>
      offer.id === offerId ? { ...offer, ...updatedOffer, dateOffered: offer.dateOffered } : offer
    );
    saveOffersToCache(updatedOffers);

  } catch (err: any) {
    console.error("Error updating offer:", err);
    toast.error(`Failed to update offer: ${err.message}`);
    throw err;
  }
};

export const deleteOfferFirestore = async (offerId: string, user: FirebaseUser) => {
  try {
    const offerRef = doc(db, 'offers', offerId);
    const offerSnap = await getDoc(offerRef);

    if (!offerSnap.exists()) {
      toast.error("Offer not found.");
      return;
    }

    const offerData = offerSnap.data() as Offer;
    if (offerData.taskerId !== user.uid) {
      toast.error("You are not authorized to delete this offer.");
      return;
    }

    await deleteDoc(offerRef);
    toast.success("Offer deleted successfully!");

    // Optimistically update local cache
    const currentOffers = loadOffersFromCache();
    const updatedOffers = currentOffers.filter(offer => offer.id !== offerId);
    saveOffersToCache(updatedOffers);

  } catch (err: any) {
    console.error("Error deleting offer:", err);
    toast.error(`Failed to delete offer: ${err.message}`);
    throw err;
  }
};

export const updateOfferStatusFirestore = async (
  offerId: string,
  status: Offer['status'],
  user: FirebaseUser
) => {
  try {
    const offerRef = doc(db, 'offers', offerId);
    const offerSnap = await getDoc(offerRef);

    if (!offerSnap.exists()) {
      toast.error("Offer not found.");
      return;
    }

    const offerData = offerSnap.data() as Offer;
    // Only allow tasker to withdraw their own offer
    // Only allow client (task poster) to accept/reject offers on their task
    if (status === 'withdrawn' && offerData.taskerId !== user.uid) {
      toast.error("You are not authorized to withdraw this offer.");
      return;
    }
    if ((status === 'accepted' || status === 'rejected') && offerData.clientId !== user.uid) {
      toast.error("You are not authorized to change the status of this offer.");
      return;
    }

    await updateDoc(offerRef, { status });
    toast.success(`Offer status updated to ${status}!`);

    // Optimistically update local cache
    const currentOffers = loadOffersFromCache();
    const updatedOffers = currentOffers.map(offer =>
      offer.id === offerId ? { ...offer, status: status, dateOffered: offer.dateOffered } : offer
    );
    saveOffersToCache(updatedOffers);

  } catch (err: any) {
    console.error("Error updating offer status:", err);
    toast.error(`Failed to update offer status: ${err.message}`);
    throw err;
  }
};

export const assignTaskToOfferFirestore = async (
  taskId: string,
  offerId: string,
  taskerId: string,
  user: FirebaseUser
) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists() || taskSnap.data()?.posterId !== user.uid) {
      toast.error("You are not authorized to assign a tasker to this task.");
      return;
    }

    await updateDoc(taskRef, {
      status: 'assigned',
      assignedTaskerId: taskerId,
      assignedOfferId: offerId,
    });
    toast.success("Task assigned successfully!");

    // Optimistically update local cache
    const currentTasks = loadTasksFromCache();
    const updatedTasks = currentTasks.map(task =>
      task.id === taskId ? { ...task, status: 'assigned' as 'assigned', assignedTaskerId: taskerId, assignedOfferId: offerId, datePosted: task.datePosted } : task
    );
    saveTasksToCache(updatedTasks);

  } catch (err: any) {
    console.error("Error assigning task to offer:", err);
    toast.error(`Failed to assign task: ${err.message}`);
    throw err;
  }
};