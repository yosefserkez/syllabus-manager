import { Task } from './data';

export type NotificationPreferences = {
  digestFrequency: 'daily' | 'weekly';
  digestTime: string;
  emailNotifications: boolean;
  upcomingTasksWindow: number;
};

export const defaultNotificationPreferences: NotificationPreferences = {
  digestFrequency: 'daily',
  digestTime: '09:00',
  emailNotifications: true,
  upcomingTasksWindow: 7,
};