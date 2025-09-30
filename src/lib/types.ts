import { Timestamp } from 'firebase/firestore';

export type TaskCategory = 
  | 'Cleaning'
  | 'Repairs'
  | 'Errands'
  | 'Deliveries'
  | 'Carpentry'
  | 'Plumbing'
  | 'Electrical'
  | 'IT Support'
  | 'Home Improvement'
  | 'Gardening'
  | 'Moving'
  | 'Event Planning'
  | 'Pet Care'
  | 'Personal Care'
  | 'Other';

export type TaskStatus = 
  | 'posted'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type BidStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected';

export type PaymentStatus = 
  | 'pending'
  | 'released'
  | 'refunded'
  | 'disputed';

export type TransactionType = 
  | 'commission'
  | 'service_fee'
  | 'payout'
  | 'subscription'
  | 'featured';

export interface Location {
  barangay: string;
  city: string;
  province: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  rating: number;
  reviews: number;
  role: 'user' | 'admin';
  kyc_status: 'pending' | 'verified' | 'rejected';
  phone?: string;
  createdAt: Date | Timestamp;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  price: number;
  clientId: string;
  client: User;
  taskerId?: string | null;
  tasker?: User | null;
  status: TaskStatus;
  location: Location | string;
  scheduleDate: Date | Timestamp;
  imageUrl?: string;
  imageHint?: string;
  serviceFee?: number;
  paymentMethod?: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  completedAt?: Date | Timestamp;
}

export interface Bid {
  id: string;
  taskId: string;
  taskerId: string;
  tasker: User;
  amount: number;
  message: string;
  status: BidStatus;
  createdAt: Date | Timestamp;
}

export interface Payment {
  id: string;
  taskId: string;
  clientId: string;
  taskerId: string;
  amount: number;
  escrowHeld: boolean;
  status: PaymentStatus;
  method: string;
  createdAt: Date | Timestamp;
  releasedAt?: Date | Timestamp;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  sourceId: string; // taskId or subscriptionId
  createdAt: Date | Timestamp;
}

export interface EarningsSummary {
  id: string;
  period: string; // YYYY-MM-DD for daily, YYYY-MM for monthly
  type: 'daily' | 'monthly';
  commissionIncome: number;
  serviceFeeIncome: number;
  subscriptionIncome: number;
  featuredIncome: number;
  totalIncome: number;
  updatedAt: Date | Timestamp;
}

export interface Review {
  id: string;
  taskId: string;
  reviewerId: string;
  reviewer: User;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: Date | Timestamp;
}