import { Task } from './task-firestore'; // Import Task interface

export const openTasks: Task[] = [
  // Example open tasks (add your actual data here)
  {
    id: "task-open-1",
    title: "Clean my apartment",
    category: "cleaning",
    description: "Need a thorough cleaning for a 2-bedroom apartment. Includes kitchen, bathroom, and living area.",
    location: "Makati City",
    budget: 1500,
    posterId: "seed-user-1",
    posterName: "Client A",
    posterAvatar: "https://randomuser.me/api/portraits/lego/2.jpg",
    datePosted: "2023-10-26T10:00:00Z",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "task-open-2",
    title: "Assemble IKEA bookshelf",
    category: "assembly",
    description: "I need help assembling a large IKEA bookshelf. All tools provided.",
    location: "Quezon City",
    budget: 800,
    posterId: "seed-user-2",
    posterName: "Client B",
    posterAvatar: "https://randomuser.me/api/portraits/lego/3.jpg",
    datePosted: "2023-10-25T14:30:00Z",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
];

export const assignedTasks: Task[] = [
  // Example assigned tasks
  {
    id: "task-assigned-1",
    title: "Fix leaky faucet",
    category: "repairs",
    description: "My kitchen faucet is leaking and needs to be repaired or replaced.",
    location: "Taguig City",
    budget: 1000,
    posterId: "seed-user-3",
    posterName: "Client C",
    posterAvatar: "https://randomuser.me/api/portraits/lego/4.jpg",
    datePosted: "2023-10-20T09:00:00Z",
    status: "assigned",
    assignedTaskerId: "seed-tasker-1",
    imageUrl: "https://images.unsplash.com/photo-1581093458791-8a6b5d174d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
];

export const completedTasks: Task[] = [
  // Example completed tasks
  {
    id: "task-completed-1",
    title: "Deliver groceries",
    category: "delivery",
    description: "Need groceries delivered from SM Supermarket to my home.",
    location: "Pasig City",
    budget: 500,
    posterId: "seed-user-4",
    posterName: "Client D",
    posterAvatar: "https://randomuser.me/api/portraits/lego/5.jpg",
    datePosted: "2023-10-15T11:00:00Z",
    status: "completed",
    assignedTaskerId: "seed-tasker-3",
    rating: 5,
    review: "Fast and efficient delivery! Highly recommended.",
    imageUrl: "https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
];