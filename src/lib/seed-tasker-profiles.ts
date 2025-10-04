import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export const seedInitialTaskerProfiles = async () => {
  const taskerProfilesCollectionRef = collection(db, 'taskerProfiles');
  const snapshot = await getDocs(taskerProfilesCollectionRef);

  if (snapshot.empty) {
    console.log("Tasker profiles collection is empty, seeding initial tasker profiles...");
    const initialTaskers = [
      {
        userId: "tasker-seed-1",
        displayName: "John Doe",
        photoURL: "https://randomuser.me/api/portraits/men/1.jpg",
        skills: ["Home Cleaning", "Gardening", "Pet Sitting"],
        bio: "Experienced and reliable tasker offering top-notch home services. Always on time and committed to quality work.",
        hourlyRate: 350,
        isTasker: true,
        dateJoined: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      },
      {
        userId: "tasker-seed-2",
        displayName: "Jane Smith",
        photoURL: "https://randomuser.me/api/portraits/women/2.jpg",
        skills: ["Plumbing", "Electrical", "Handyman Services"],
        bio: "Certified handyman with 5+ years of experience in repairs and installations. No job too big or small!",
        hourlyRate: 500,
        isTasker: true,
        dateJoined: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
      },
      {
        userId: "tasker-seed-3",
        displayName: "Peter Jones",
        photoURL: "https://randomuser.me/api/portraits/men/3.jpg",
        skills: ["Moving", "Delivery", "Furniture Assembly"],
        bio: "Efficient and strong, ready to help with all your moving and assembly needs. Fast and careful service.",
        hourlyRate: 400,
        isTasker: true,
        dateJoined: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      },
      {
        userId: "tasker-seed-4",
        displayName: "Sarah Lee",
        photoURL: "https://randomuser.me/api/portraits/women/4.jpg",
        skills: ["Painting", "Graphic Design", "Marketing"],
        bio: "Creative professional offering painting services and digital marketing expertise. Let's bring your ideas to life!",
        hourlyRate: 600,
        isTasker: true,
        dateJoined: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      },
    ];

    for (const tasker of initialTaskers) {
      await addDoc(taskerProfilesCollectionRef, tasker);
    }
    toast.info("Initial tasker profiles added!");
  }
};