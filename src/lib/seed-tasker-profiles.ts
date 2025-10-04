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
        displayName: "Kuya Juan",
        photoURL: "https://randomuser.me/api/portraits/men/21.jpg",
        skills: ["Plumbing", "Electrical", "Carpentry", "Assembly Services"],
        bio: "Experienced handyman with 10+ years in home repairs and installations. Mabilis at maaasahan!",
        hourlyRate: 350,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-2",
        displayName: "Ate Maria",
        photoURL: "https://randomuser.me/api/portraits/women/22.jpg",
        skills: ["Home Cleaning", "Office Cleaning", "Deep Cleaning"],
        bio: "Dedicated cleaner providing top-notch cleaning services for homes and offices. Malinis at maayos ang trabaho!",
        hourlyRate: 250,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-3",
        displayName: "Manong Pedro",
        photoURL: "https://randomuser.me/api/portraits/men/23.jpg",
        skills: ["Delivery", "Errands", "Grocery Shopping"],
        bio: "Fast and reliable delivery service for documents, packages, and groceries. On-time palagi!",
        hourlyRate: 180,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-4",
        displayName: "Inday Elena",
        photoURL: "https://randomuser.me/api/portraits/women/24.jpg",
        skills: ["Painting Services", "Wall Repair"],
        bio: "Professional painter for residential and commercial spaces. Quality finish guaranteed!",
        hourlyRate: 300,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-5",
        displayName: "Mang Ramon",
        photoURL: "https://randomuser.me/api/portraits/men/25.jpg",
        skills: ["Laptop Fix", "Appliance Repair", "Electronics Setup"],
        bio: "Tech-savvy individual offering repair services for laptops and home appliances. Expert sa gadgets!",
        hourlyRate: 400,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-6",
        displayName: "Teacher Sofia",
        photoURL: "https://randomuser.me/api/portraits/women/26.jpg",
        skills: ["Tutoring (Math)", "Tutoring (English)", "Online Teaching"],
        bio: "Patient and effective tutor for students of all ages. Helping you achieve academic success!",
        hourlyRate: 280,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-7",
        displayName: "Kuya Carlo",
        photoURL: "https://randomuser.me/api/portraits/men/27.jpg",
        skills: ["Carpentry", "Furniture Assembly", "Woodwork"],
        bio: "Skilled carpenter for custom furniture and repairs. Gawaing kahoy, ako bahala!",
        hourlyRate: 380,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-8",
        displayName: "Ate Anna",
        photoURL: "https://randomuser.me/api/portraits/women/28.jpg",
        skills: ["Gardening", "Landscaping", "Plant Care"],
        bio: "Passionate gardener ready to transform your outdoor space. Green thumb, happy plants!",
        hourlyRate: 220,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-9",
        displayName: "Manong Mark",
        photoURL: "https://randomuser.me/api/portraits/men/29.jpg",
        skills: ["Moving", "Hauling", "Packing"],
        bio: "Efficient and careful mover for your relocation needs. Walang hassle sa paglipat!",
        hourlyRate: 450,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-10",
        displayName: "Ate Grace",
        photoURL: "https://randomuser.me/api/portraits/women/30.jpg",
        skills: ["Pet Sitting", "Dog Walking", "Pet Care"],
        bio: "Loving and responsible pet sitter for your furry friends. Alaga ang pets mo sa akin!",
        hourlyRate: 200,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      // Additional Taskers for marketing purposes
      {
        userId: "seed-tasker-11",
        displayName: "Kuya Benny",
        photoURL: "https://randomuser.me/api/portraits/men/31.jpg",
        skills: ["Construction", "Renovation", "Demolition"],
        bio: "Expert in small to medium construction and renovation projects. Building dreams, one brick at a time!",
        hourlyRate: 500,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-12",
        displayName: "Chef Carla",
        photoURL: "https://randomuser.me/api/portraits/women/32.jpg",
        skills: ["Catering", "Personal Chef", "Meal Prep"],
        bio: "Bringing delicious meals to your table. From intimate dinners to small events, I've got you covered!",
        hourlyRate: 400,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-13",
        displayName: "Kuya David",
        photoURL: "https://randomuser.me/api/portraits/men/33.jpg",
        skills: ["Personal Driver", "Airport Transfer", "Logistics"],
        bio: "Safe and reliable driver for all your transportation needs. Your comfort is my priority!",
        hourlyRate: 250,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-14",
        displayName: "Event Planner Emily",
        photoURL: "https://randomuser.me/api/portraits/women/34.jpg",
        skills: ["Event Planning", "Party Organizer", "Decorations"],
        bio: "Making your special occasions unforgettable. Let's plan your perfect event!",
        hourlyRate: 600,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-15",
        displayName: "Mang Frank",
        photoURL: "https://randomuser.me/api/portraits/men/35.jpg",
        skills: ["General Repairs", "Home Maintenance", "Appliance Installation"],
        bio: "Your go-to guy for all household fixes. No job too small, no problem too big!",
        hourlyRate: 320,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-16",
        displayName: "Graphic Designer Gina",
        photoURL: "https://randomuser.me/api/portraits/women/36.jpg",
        skills: ["Graphic Design", "Logo Design", "Social Media Content"],
        bio: "Creative graphic designer ready to elevate your brand's visual identity. Let's make it pop!",
        hourlyRate: 480,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
      {
        userId: "seed-tasker-17",
        displayName: "Kuya Henry",
        photoURL: "https://randomuser.me/api/portraits/men/37.jpg",
        skills: ["Errands", "Personal Assistant", "Shopping"],
        bio: "Your reliable personal helper for daily errands and tasks. Consider it done!",
        hourlyRate: 200,
        isTasker: true,
        dateJoined: new Date().toISOString(),
      },
    ];

    for (const tasker of initialTaskers) {
      await setDoc(doc(taskerProfilesCollectionRef, tasker.userId), tasker);
    }
    toast.info("Initial demo tasker profiles added!");
  } else {
    console.log("Tasker profiles collection is not empty, skipping seeding.");
  }
};