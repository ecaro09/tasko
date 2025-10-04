import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

export const seedInitialTasks = async () => {
  const tasksCollectionRef = collection(db, 'tasks');
  const snapshot = await getDocs(tasksCollectionRef);

  if (snapshot.empty) {
    console.log("Tasks collection is empty, seeding initial tasks...");
    const initialTasks = [
      {
        title: "Deep Cleaning for 2-Bedroom Condo",
        category: "cleaning",
        description: "Need a thorough deep cleaning for a 2-bedroom, 1-bath condo. Includes kitchen, bathrooms, living area, and bedrooms. All cleaning supplies provided.",
        location: "Makati City, Metro Manila",
        budget: 2500,
        posterId: "seed-user-1",
        posterName: "Maria Santos",
        posterAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
        datePosted: serverTimestamp(),
        status: "open",
        imageUrl: "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      },
      {
        title: "Fix Leaky Faucet in Bathroom",
        category: "repairs",
        description: "Bathroom faucet is constantly dripping. Need someone to diagnose and fix the leak. Parts may be needed.",
        location: "Quezon City, Metro Manila",
        budget: 800,
        posterId: "seed-user-2",
        posterName: "Juan Dela Cruz",
        posterAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
        datePosted: serverTimestamp(),
        status: "open",
        imageUrl: "https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      },
      {
        title: "Move Furniture from Apartment to House",
        category: "moving",
        description: "Need help moving a sofa, bed frame, and a few boxes from a 3rd-floor apartment to a ground-floor house. Both locations are within Pasig City.",
        location: "Pasig City, Metro Manila",
        budget: 3000,
        posterId: "seed-user-3",
        posterName: "Aling Nena",
        posterAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
        datePosted: serverTimestamp(),
        status: "open",
        imageUrl: "https://images.unsplash.com/photo-1581093458791-8a6b5d174d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      },
      {
        title: "Grocery Delivery from SM Aura",
        category: "delivery",
        description: "Need groceries picked up from SM Aura Premier and delivered to my home in Taguig. List will be provided. Payment for groceries will be reimbursed.",
        location: "Taguig City, Metro Manila",
        budget: 500,
        posterId: "seed-user-4",
        posterName: "Roberto Lim",
        posterAvatar: "https://randomuser.me/api/portraits/men/55.jpg",
        datePosted: serverTimestamp(),
        status: "open",
        imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      },
      {
        title: "Mount TV on Wall",
        category: "assembly",
        description: "Need a 55-inch TV mounted on a concrete wall in the living room. Mount bracket is already available. Tools required.",
        location: "Mandaluyong City, Metro Manila",
        budget: 1000,
        posterId: "seed-user-5",
        posterName: "Sofia Reyes",
        posterAvatar: "https://randomuser.me/api/portraits/women/77.jpg",
        datePosted: serverTimestamp(),
        status: "open",
        imageUrl: "https://images.unsplash.com/photo-1599669454699-248893623440?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
      },
      {
        title: "Interior Wall Painting for Small Room",
        category: "painting",
        description: "Paint one small bedroom (approx. 3m x 3m) with a single color. Paint and supplies will be provided. Room needs to be prepped.",
        location: "Pasay City, Metro Manila",
        budget: 1800,
        posterId: "seed-user-6",
        posterName: "Carlos Garcia",
        posterAvatar: "https://randomuser.me/api/portraits/men/88.jpg",
        datePosted: serverTimestamp(),
        status: "open",
        imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Reusing image
      },
      {
        title: "Assemble IKEA Bookshelf",
        category: "assembly",
        description: "Need help assembling a KALLAX bookshelf from IKEA. All parts are new in box. Instructions available.",
        location: "Taguig City, Metro Manila",
        budget: 700,
        posterId: "seed-user-1",
        posterName: "Maria Santos",
        posterAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
        datePosted: serverTimestamp(),
        status: "open",
        imageUrl: "https://images.unsplash.com/photo-1581093458791-8a6b5d174d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Reusing image
      },
      {
        title: "Marketing Research for New Product Launch",
        category: "marketing",
        description: "Conduct market research and competitive analysis for a new local food product. Deliver a report with key findings and recommendations.",
        location: "Remote (Philippines)",
        budget: 7000,
        posterId: "seed-user-2",
        posterName: "Juan Dela Cruz",
        posterAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
        datePosted: serverTimestamp(),
        status: "open",
        imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965da0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80", // Reusing image
      },
    ];

    for (const task of initialTasks) {
      await addDoc(tasksCollectionRef, task);
    }
    toast.info("Initial tasks added!");
  }
};