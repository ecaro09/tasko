import { Task } from './task-firestore';

const TASKS_CACHE_KEY = 'tasks_cache';

export const saveTasksToCache = (tasks: Task[]) => {
  try {
    localStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks to local storage:", error);
  }
};

export const loadTasksFromCache = (): Task[] => {
  try {
    const cachedTasks = localStorage.getItem(TASKS_CACHE_KEY);
    return cachedTasks ? JSON.parse(cachedTasks) : [];
  } catch (error) {
    console.error("Error loading tasks from local storage:", error);
    return [];
  }
};

export const clearTasksCache = () => {
  try {
    localStorage.removeItem(TASKS_CACHE_KEY);
  } catch (error) {
    console.error("Error clearing tasks cache from local storage:", error);
  }
};