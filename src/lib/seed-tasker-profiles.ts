import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  setDoc,
  doc,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { TaskerProfile } from '@/lib/tasker-profile-firestore'; // Import TaskerProfile interface

// Function to seed initial tasker profiles
export const seedInitialTaskerProfiles = async () => {
  const taskerProfilesCollectionRef = collection(db, 'taskerProfiles');
  const snapshot = await getDocs(taskerProfilesCollectionRef);

  if (snapshot.empty) {
    console.log("Tasker profiles collection is empty, seeding initial tasker profiles...");
    const initialTaskers: TaskerProfile[] = [
      {
        userId: "seed-tasker-1",
        displayName: "Juan Handyman",
        photoURL: "https://randomuser.me/api/portraits/men/21.jpg",
        skills: ["Plumbing", "Electrical", "Carpentry", "Assembly Services"],
        bio: "Experienced handyman with 10+ years in home repairs and installations. Mabilis at maaasahan!",
        hourlyRate: 350,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-2",
        displayName: "Maria Cleaner",
        photoURL: "https://randomuser.me/api/portraits/women/22.jpg",
        skills: ["Home Cleaning", "Office Cleaning", "Deep Cleaning"],
        bio: "Dedicated cleaner providing top-notch cleaning services for homes and offices. Malinis at maayos ang trabaho!",
        hourlyRate: 250,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-3",
        displayName: "Pedro Deliver",
        photoURL: "https://randomuser.me/api/portraits/men/23.jpg",
        skills: ["Delivery", "Errands", "Grocery Shopping"],
        bio: "Fast and reliable delivery service for documents, packages, and groceries. On-time palagi!",
        hourlyRate: 180,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-4",
        displayName: "Elena Painter",
        photoURL: "https://randomuser.me/api/portraits/women/24.jpg",
        skills: ["Painting Services", "Wall Repair"],
        bio: "Professional painter for residential and commercial spaces. Quality finish guaranteed!",
        hourlyRate: 300,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-5",
        displayName: "Ramon Tech",
        photoURL: "https://randomuser.me/api/portraits/men/25.jpg",
        skills: ["Laptop Fix", "Appliance Repair", "Electronics Setup"],
        bio: "Tech-savvy individual offering repair services for laptops and home appliances. Expert sa gadgets!",
        hourlyRate: 400,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-6",
        displayName: "Sofia Tutor",
        photoURL: "https://randomuser.me/api/portraits/women/26.jpg",
        skills: ["Tutoring (Math)", "Tutoring (English)", "Online Teaching"],
        bio: "Patient and effective tutor for students of all ages. Helping you achieve academic success!",
        hourlyRate: 280,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-7",
        displayName: "Carlo Carpenter",
        photoURL: "https://randomuser.me/api/portraits/men/27.jpg",
        skills: ["Carpentry", "Furniture Assembly", "Woodwork"],
        bio: "Skilled carpenter for custom furniture and repairs. Gawaing kahoy, ako bahala!",
        hourlyRate: 380,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-8",
        displayName: "Anna Gardener",
        photoURL: "https://randomuser.me/api/portraits/women/28.jpg",
        skills: ["Gardening", "Landscaping", "Plant Care"],
        bio: "Passionate gardener ready to transform your outdoor space. Green thumb, happy plants!",
        hourlyRate: 220,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-9",
        displayName: "Mark Mover",
        photoURL: "https://randomuser.me/api/portraits/men/29.jpg",
        skills: ["Moving", "Hauling", "Packing"],
        bio: "Efficient and careful mover for your relocation needs. Walang hassle sa paglipat!",
        hourlyRate: 450,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-10",
        displayName: "Grace Pet Sitter",
        photoURL: "https://randomuser.me/api/portraits/women/30.jpg",
        skills: ["Pet Sitting", "Dog Walking", "Pet Care"],
        bio: "Loving and responsible pet sitter for your furry friends. Alaga ang pets mo sa akin!",
        hourlyRate: 200,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
    ];

    for (const tasker of initialTaskers) {
      await setDoc(doc(taskerProfilesCollectionRef, tasker.userId), tasker);
    }
    toast.info("Initial demo tasker profiles added!");
  }
};