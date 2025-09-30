'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Calendar, Wallet, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Task, User } from '@/lib/types';

interface RealTimeTaskListProps {
  filter?: 'all' | 'user' | 'category';
  category?: string;
  limit?: number;
}

export default function RealTimeTaskList({ 
  filter = 'all', 
  category, 
  limit 
}: RealTimeTaskListProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));

    if (filter === 'user' && user) {
      q = query(q, where('clientId', '==', user.uid));
    } else if (filter === 'all') {
      q = query(q, where('status', '==', 'posted'));
    }

    if (category) {
      q = query(q, where('category', '==', category));
    }

    const unsubscribe = onSnapshot(q, 
      async (snapshot) => {
        const tasksData: Task[] = [];
        
        for (const docSnap of snapshot.docs) {
          const taskData = docSnap.data();
          
          const clientDoc = await getDoc(doc(db, 'users', taskData.clientId));
          const client = clientDoc.exists() ? (clientDoc.data() as User) : null;
          
          let tasker = null;
          if (taskData.taskerId) {
            const taskerDoc = await getDoc(doc(db, 'users', taskData.taskerId));
            tasker = taskerDoc.exists() ? (taskerDoc.data() as User) : null;
          }

          tasksData.push({
            id: docSnap.id,
            ...taskData,
            client: client,
            tasker: tasker,
          } as Task);
        }

        const limitedTasks = limit ? tasksData.slice(0, limit) : tasksData;
        setTasks(limitedTasks);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filter, user, category, limit]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: limit || 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No tasks found</p>
          {filter === 'user' && (
            <Button asChild className="mt-4">
              <Link to="/tasks/new">Post Your First Task</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="secondary">
                {task.category}
              </Badge>
              <Badge
                variant={
                  task.status === 'posted' ? 'default' :
                  task.status === 'assigned' ? 'secondary' :
                  task.status === 'completed' ? 'outline' : 'destructive'
                }
              >
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight">
              <Link 
                to={`/tasks/${task.id}`}
                className="hover:text-primary transition-colors"
              >
                {task.title}
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {typeof task.location === 'string' 
                  ? task.location 
                  : `${task.location.barangay}, ${task.location.city}`
                }
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {task.scheduleDate instanceof Date 
                  ? task.scheduleDate.toLocaleDateString()
                  : (task.scheduleDate as Timestamp).toDate().toLocaleDateString()
                }
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm">
                <UserIcon className="h-4 w-4" />
                <span className="font-medium">{task.client?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1 text-lg font-bold text-primary">
                <Wallet className="h-4 w-4" />
                <span>₱{task.price.toLocaleString()}</span>
              </div>
            </div>
            
            <Button asChild className="w-full">
              <Link to={`/tasks/${task.id}`}>
                View Details
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}