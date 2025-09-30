// src/lib/types.ts

export type TaskStatus = 'posted' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';

export type Location = {
  barangay: string;
  city: string;
  province: string;
};

export type UserRole = 'client' | 'tasker' | 'admin';

export type User = {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phoneNumber?: string;
  address?: Location;
  bio?: string;
  skills?: string[];
  rating?: number;
  totalJobs?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  location: Location;
  scheduleDate: Date;
  clientId: string;
  client: User; // Populated client data
  taskerId?: string;
  tasker?: User; // Populated tasker data
  status: TaskStatus;
  serviceFee: number;
  paymentMethod: string;
  imageUrl?: string;
  imageHint?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
};

export type Bid = {
  id: string;
  taskId: string;
  taskerId: string;
  tasker: User; // Populated tasker data
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
};

export type Review = {
  id: string;
  taskId: string;
  reviewerId: string;
  reviewedId: string;
  rating: number;
  comment: string;
  createdAt: Date;
};

export type EarningsSummary = {
  id: string; // e.g., month-year like "2023-10"
  taskerId: string;
  totalEarnings: number;
  totalTasksCompleted: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
};