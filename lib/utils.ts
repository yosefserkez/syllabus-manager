import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TaskType } from './data';
import { addDays, isAfter, isBefore, isToday, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTaskTypeColor = (type: TaskType): { bg: string; text: string } => {
  switch (type) {
    case 'assignment':
      return { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300' };
    case 'reading':
      return { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300' };
    case 'test':
      return { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300' };
    case 'quiz':
      return { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-300' };
    case 'project':
      return { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-300' };
    default:
      return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' };
  }
};

export const getTaskDueStatus = (dueDate: string, status: string) => {
  const date = parseISO(dueDate);
  const today = new Date();
  const soonThreshold = addDays(today, 3);

  if (status === 'completed') return 'completed';
  if (isBefore(date, today)) return 'overdue';
  if (isToday(date)) return 'due-today';
  if (isBefore(date, soonThreshold)) return 'due-soon';
  return 'upcoming';
};

export const getTaskStatusColor = (dueStatus: string): string => {
  switch (dueStatus) {
    case 'completed':
      return 'bg-green-50 dark:bg-green-900/20';
    case 'overdue':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    case 'due-today':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    case 'due-soon':
      return 'bg-orange-50 dark:bg-orange-900/20';
    default:
      return '';
  }
};