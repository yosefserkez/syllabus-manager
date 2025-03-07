"use client";

import { render } from '@react-email/render';
import TaskDigestEmail from '@/emails/task-digest';

export type TaskEmailData = {
  id: string;
  title: string;
  description: string;
  course: string;
  courseCode: string;
  dueDate: string;
};

export function renderTaskDigestEmail(
  tasks: TaskEmailData[],
  tasksByCourse: Record<string, TaskEmailData[]>,
  daysWindow: number
): string {
  return render(
    TaskDigestEmail({
      tasks,
      tasksByCourse,
      daysWindow,
    })
  );
}