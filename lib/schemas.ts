import { z } from 'zod';

// Base schemas
export const dateSchema = z.string().refine(
  (value) => /^\d{4}-\d{2}-\d{2}$/.test(value),
  {
    message: "Date must be in YYYY-MM-DD format",
  }
);

export const taskTypeSchema = z.enum([
  "assignment",
  "reading",
  "test",
  "quiz",
  "project",
  "other"
]);

export const taskStatusSchema = z.enum([
  "not-started"
]);

// Main schemas
export const semesterSchema = z.object({
  name: z.string().optional().refine(
    (value) => value === undefined || value.trim().length > 0,
    {
      message: "Semester name is required",
    }
  ),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional()
}).refine(data => {
  if (!data.startDate || !data.endDate) return true;
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

export const courseSchema = z.object({
  name: z.string().optional().refine(
    (value) => value === undefined || value.trim().length > 0,
    {
      message: "Course name is required",
    }
  ),
  code: z.string().optional().refine(
    (value) => value === undefined || /^[A-Za-z0-9]+$/.test(value), // Loose validation without regex
    {
      message: "Course code must be alphanumeric",
    }
  ),
  description: z.string().optional(),
  instructor: z.string().optional()
});

export const taskSchema = z.object({
  title: z.string().optional().refine(
    (value) => value === undefined || value.trim().length > 0,
    {
      message: "Title is required",
    }
  ),
  description: z.string().optional(),
  taskType: taskTypeSchema.optional(),
  dueDate: dateSchema.optional(),
  status: taskStatusSchema.optional()
});

// Combined schema for syllabus parsing
export const syllabusSchema = z.object({
  semester: semesterSchema,
  course: courseSchema,
  tasks: z.array(taskSchema)
}).refine(data => {
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 5);

  if (data.semester.startDate && data.semester.endDate) {
    const semesterStart = new Date(data.semester.startDate);
    const semesterEnd = new Date(data.semester.endDate);

    if (semesterStart > maxDate || semesterEnd > maxDate) {
      return false;
    }
  }

  return data.tasks.every(task => {
    if (!task.dueDate) return true;
    const dueDate = new Date(task.dueDate);
    return dueDate <= maxDate;
  });
}, {
  message: "Dates cannot be more than 5 years in the future"
});

// Type inference
export type SyllabusData = z.infer<typeof syllabusSchema>;
