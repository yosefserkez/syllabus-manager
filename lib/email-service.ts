"use client";

import { Resend } from 'resend';
import { renderTaskDigestEmail, TaskEmailData } from './email-renderer';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function sendTaskDigestEmail(
  email: string,
  frequency: string,
  tasks: TaskEmailData[],
  tasksByCourse: Record<string, TaskEmailData[]>,
  daysWindow: number
): Promise<void> {
  const emailHtml = renderTaskDigestEmail(tasks, tasksByCourse, daysWindow);

  await resend.emails.send({
    from: 'Syllabus Manager <notifications@syllabusmanager.com>',
    to: email,
    subject: `Your ${frequency} task digest`,
    html: emailHtml,
  });
}