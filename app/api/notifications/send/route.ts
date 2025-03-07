import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { addDays, isBefore, isAfter } from 'date-fns';
import { TaskEmailData } from '@/lib/email-renderer';
import { sendTaskDigestEmail } from '@/lib/email-service';

type NotificationPreference = {
  user_id: string;
  digest_frequency: string;
  digest_time: string;
  email_notifications: boolean;
  upcoming_tasks_window: number;
  users: {
    email: string;
  };
};

export async function POST() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: cookies()
      }
    );

    // Get all users with their notification preferences
    const { data: users, error: usersError } = await supabase
      .from('notification_preferences')
      .select(`
        user_id,
        digest_frequency,
        digest_time,
        email_notifications,
        upcoming_tasks_window,
        users:auth.users (
          email
        )
      `)
      .eq('email_notifications', true) as { 
        data: NotificationPreference[] | null; 
        error: any; 
      };

    if (usersError) throw usersError;
    if (!users) return NextResponse.json({ success: true });

    for (const user of users) {
      // Get user's tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks_with_courses')
        .select('*')
        .eq('user_id', user.user_id)
        .order('due_date', { ascending: true });

      if (tasksError) continue;
      if (!tasks) continue;

      const today = new Date();
      const windowEnd = addDays(today, user.upcoming_tasks_window);

      // Filter upcoming tasks
      const upcomingTasks: TaskEmailData[] = tasks
        .filter((task) => {
          const dueDate = new Date(task.due_date);
          return (
            task.status !== 'completed' &&
            isBefore(dueDate, windowEnd) &&
            isAfter(dueDate, today)
          );
        })
        .map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          course: task.course_name,
          courseCode: task.course_code,
          dueDate: task.due_date,
        }));

      if (upcomingTasks.length === 0) continue;

      // Group tasks by course
      const tasksByCourse = upcomingTasks.reduce((acc, task) => {
        if (!acc[task.course]) {
          acc[task.course] = [];
        }
        acc[task.course].push(task);
        return acc;
      }, {} as Record<string, TaskEmailData[]>);

      // Send email
      await sendTaskDigestEmail(
        user.users.email,
        user.digest_frequency,
        upcomingTasks,
        tasksByCourse,
        user.upcoming_tasks_window
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}