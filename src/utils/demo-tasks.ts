import { Task } from '@/hooks/use-tasks';

export const DEMO_TASKS: Task[] = [
  {
    id: 'demo-1',
    title: 'Deep Cleaning for Apartment',
    description: 'Looking for a thorough deep cleaning service for a 2-bedroom apartment in Makati. Includes kitchen, bathroom, living room, and bedrooms. All cleaning supplies provided.',
    category: 'Cleaning',
    budget: 1200,
    location: 'Makati, Metro Manila',
    imageUrl: 'https://via.placeholder.com/400x200?text=Cleaning+Service',
    posterId: 'demo-user-1',
    posterName: 'Demo User A',
    posterAvatar: 'https://via.placeholder.com/50/FF5733/FFFFFF?text=DA',
    datePosted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: 'open',
  },
  {
    id: 'demo-2',
    title: 'Grocery Delivery from SM Aura',
    description: 'Need groceries picked up from SM Aura Premier and delivered to a condo in Taguig. List will be provided. Must have own transportation.',
    category: 'Delivery',
    budget: 650,
    location: 'Taguig, Metro Manila',
    imageUrl: 'https://via.placeholder.com/400x200?text=Grocery+Delivery',
    posterId: 'demo-user-2',
    posterName: 'Demo User B',
    posterAvatar: 'https://via.placeholder.com/50/33FF57/FFFFFF?text=DB',
    datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: 'open',
  },
  {
    id: 'demo-3',
    title: 'Leaky Faucet Repair',
    description: 'Urgent repair needed for a leaky kitchen faucet in Quezon City. Please bring necessary tools and parts if possible.',
    category: 'Repairs',
    budget: 800,
    location: 'Quezon City, Metro Manila',
    imageUrl: 'https://via.placeholder.com/400x200?text=Faucet+Repair',
    posterId: 'demo-user-3',
    posterName: 'Demo User C',
    posterAvatar: 'https://via.placeholder.com/50/3357FF/FFFFFF?text=DC',
    datePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'open',
  },
  {
    id: 'demo-4',
    title: 'Custom Bookshelf Assembly',
    description: 'Assembly of a custom-made wooden bookshelf. Experience with carpentry and furniture assembly required. Tools will be provided.',
    category: 'Carpentry',
    budget: 1500,
    location: 'Pasig, Metro Manila',
    imageUrl: 'https://via.placeholder.com/400x200?text=Bookshelf+Assembly',
    posterId: 'demo-user-4',
    posterName: 'Demo User D',
    posterAvatar: 'https://via.placeholder.com/50/FF33E6/FFFFFF?text=DD',
    datePosted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    status: 'open',
  },
  {
    id: 'demo-5',
    title: 'Laptop Software Troubleshooting',
    description: 'My laptop is running very slow and has some software issues. Need someone to diagnose and fix the problem. Remote support is an option.',
    category: 'IT Support',
    budget: 950,
    location: 'Mandaluyong, Metro Manila',
    imageUrl: 'https://via.placeholder.com/400x200?text=IT+Support',
    posterId: 'demo-user-5',
    posterName: 'Demo User E',
    posterAvatar: 'https://via.placeholder.com/50/33FFFF/FFFFFF?text=DE',
    datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: 'open',
  },
];