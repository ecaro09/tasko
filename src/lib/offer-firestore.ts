import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, updateDoc, DocumentData, getDoc, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { User as FirebaseUser } from 'firebase/auth';

export interface Offer {
  id: string;
  taskId: string;
  taskerId: string;
  taskerName: string;
  taskerAvatar?: string;
  clientId: string; // The ID of the user who posted the task
  offerAmount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'cancelled'; // Added 'cancelled' status
  dateCreated: string;
  dateUpdated?: string;
}

export const addOfferFirestore = async (
  taskId: string,
  clientId: string,
  offerAmount: number,
  message: string,
  user: FirebaseUser,
  taskerProfile: { displayName: string; photoURL?: string }
) => {
  try {
    await addDoc(collection(db, 'offers'), {
      taskId,
      taskerId: user.uid,
      taskerName: taskerProfile.displayName,
      taskerAvatar: taskerProfile.photoURL,
      clientId,
      offerAmount,
      message,
      status: 'pending',
      dateCreated: serverTimestamp(),
    });
    toast.success("Offer submitted successfully!");
  } catch (err: any) {
    console.error("Error adding offer:", err);
    toast.error(`Failed to submit offer: ${err.message}`);
    throw err;
  }
};

export const acceptOfferFirestore = async (offerId: string, taskId: string, user: FirebaseUser): Promise<{ taskerId: string; clientId: string } | null> => {
  try {
    const offerRef = doc(db, 'offers', offerId);
    const offerSnap = await getDoc(offerRef);
    if (!offerSnap.exists()) {
      toast.error("Offer not found.");
      return null;
    }
    const offerData = offerSnap.data() as Offer;

    // Ensure the current user is the client of the task
    if (offerData.clientId !== user.uid) {
      toast.error("You are not authorized to accept this offer.");
      return null;
    }

    // Reject all other pending offers for this task
    const otherOffersQuery = query(
      collection(db, 'offers'),
      where('taskId', '==', taskId),
      where('status', '==', 'pending'),
      where('__name__', '!=', offerId) // Exclude the current offer
    );
    const otherOffersSnapshot = await getDocs(otherOffersQuery);
    const batchUpdates: Promise<void>[] = [];
    otherOffersSnapshot.forEach((doc) => {
      batchUpdates.push(updateDoc(doc.ref, { status: 'rejected', dateUpdated: serverTimestamp() }));
    });
    await Promise.all(batchUpdates);


    await updateDoc(offerRef, {
      status: 'accepted',
      dateUpdated: serverTimestamp(),
    });

    // Update the task status to 'assigned' and set the correct assignedTaskerId
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      status: 'assigned',
      assignedTaskerId: offerData.taskerId,
      assignedOfferId: offerId,
      dateUpdated: serverTimestamp(),
    });

    toast.success("Offer accepted!");
    return { taskerId: offerData.taskerId, clientId: offerData.clientId };
  } catch (err: any) {
    console.error("Error accepting offer:", err);
    toast.error(`Failed to accept offer: ${err.message}`);
    throw err;
  }
};

export const rejectOfferFirestore = async (offerId: string, user: FirebaseUser) => {
  try {
    const offerRef = doc(db, 'offers', offerId);
    const offerSnap = await getDoc(offerRef);
    if (!offerSnap.exists()) {
      toast.error("Offer not found.");
      return;
    }
    const offerData = offerSnap.data() as Offer;

    // Ensure the current user is the client of the task
    if (offerData.clientId !== user.uid) {
      toast.error("You are not authorized to reject this offer.");
      return;
    }

    await updateDoc(offerRef, {
      status: 'rejected',
      dateUpdated: serverTimestamp(),
    });
    toast.info("Offer rejected.");
  } catch (err: any) {
    console.error("Error rejecting offer:", err);
    toast.error(`Failed to reject offer: ${err.message}`);
    throw err;
  }
};

export const withdrawOfferFirestore = async (offerId: string, user: FirebaseUser) => {
  try {
    const offerRef = doc(db, 'offers', offerId);
    const offerSnap = await getDoc(offerRef);
    if (!offerSnap.exists()) {
      toast.error("Offer not found.");
      return;
    }
    const offerData = offerSnap.data() as Offer;

    // Ensure the current user is the tasker who made the offer
    if (offerData.taskerId !== user.uid) {
      toast.error("You are not authorized to withdraw this offer.");
      return;
    }

    await updateDoc(offerRef, {
      status: 'withdrawn',
      dateUpdated: serverTimestamp(),
    });
    toast.info("Offer withdrawn.");
  } catch (err: any) {
    console.error("Error withdrawing offer:", err);
    toast.error(`Failed to withdraw offer: ${err.message}`);
    throw err;
  }
};

export const cancelOffersForTaskFirestore = async (taskId: string, user: FirebaseUser) => {
  try {
    const offersQuery = query(
      collection(db, 'offers'),
      where('taskId', '==', taskId),
      where('clientId', '==', user.uid) // Ensure only client's offers for this task are affected
    );
    const offersSnapshot = await getDocs(offersQuery);

    const batchUpdates: Promise<void>[] = [];
    offersSnapshot.forEach((doc) => {
      const offerData = doc.data() as Offer;
      // Only update offers that are not already completed/cancelled by other means
      if (offerData.status === 'pending' || offerData.status === 'accepted') {
        batchUpdates.push(updateDoc(doc.ref, { status: 'cancelled', dateUpdated: serverTimestamp() }));
      }
    });
    await Promise.all(batchUpdates);
    console.log(`Cancelled ${offersSnapshot.size} offers for task ${taskId}.`);
  } catch (err: any) {
    console.error("Error cancelling offers for task:", err);
    toast.error(`Failed to cancel associated offers: ${err.message}`);
    throw err;
  }
};

export const fetchOffersFirestore = (
  onOffersFetched: (offers: Offer[]) => void,
  onError: (error: string) => void
) => {
  const offersCollectionRef = collection(db, 'offers');
  const q = query(offersCollectionRef);

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedOffers: Offer[] = snapshot.docs.map((doc) => {
      const data = doc.data() as DocumentData;
      return {
        id: doc.id,
        taskId: data.taskId,
        taskerId: data.taskerId,
        taskerName: data.taskerName,
        taskerAvatar: data.taskerAvatar,
        clientId: data.clientId,
        offerAmount: data.offerAmount,
        message: data.message,
        status: data.status,
        dateCreated: data.dateCreated?.toDate().toISOString() || new Date().toISOString(),
        dateUpdated: data.dateUpdated?.toDate().toISOString(),
      };
    });
    onOffersFetched(fetchedOffers);
  }, (err) => {
    console.error("Error fetching offers:", err);
    onError("Failed to fetch offers.");
    toast.error("Failed to load offers.");
  });

  return unsubscribe;
};