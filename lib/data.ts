import { z } from 'zod';

export type Semester = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

export type Course = {
  id: string;
  name: string;
  code: string;
  description?: string;
  instructor?: string;
  semesterId: string;
};

export type TaskType = "assignment" | "reading" | "test" | "quiz" | "project" | "other";

export type Task = {
  id: string;
  title: string;
  description: string;
  course: string;
  courseCode: string;
  taskType: TaskType;
  dueDate: string;
  status: "not-started" | "in-progress" | "completed";
};

// Schema for parsed syllabus data
export const semesterSchema = z.object({
  name: z.string(),
  startDate: z.string(),
  endDate: z.string()
});

export const courseSchema = z.object({
  name: z.string(),
  code: z.string(),
  description: z.string().optional(),
  instructor: z.string().optional()
});

export const taskSchema = z.object({
  title: z.string(),
  description: z.string(),
  taskType: z.enum(["assignment", "reading", "test", "quiz", "project", "other"]),
  dueDate: z.string(),
  status: z.enum(["not-started", "in-progress", "completed"])
});

// Initial semester data
let semestersData: Semester[] = [
  {
    id: "1",
    name: "Spring 2024",
    startDate: "2024-01-15",
    endDate: "2024-05-15"
  },
  {
    id: "2",
    name: "Fall 2024",
    startDate: "2024-08-15",
    endDate: "2024-12-15"
  },
  {
    id: "3",
    name: "Spring 2025",
    startDate: "2025-01-15",
    endDate: "2025-05-15"
  }
];

// We'll use these as initial data, but allow modifications
let coursesData: Course[] = [
  {
    id: "1",
    name: "History 101",
    code: "HIST101",
    description: "Introduction to World History",
    instructor: "Dr. Smith",
    semesterId: "3"
  },
  {
    id: "2",
    name: "Calculus II",
    code: "MATH202",
    description: "Advanced Calculus",
    instructor: "Prof. Johnson",
    semesterId: "3"
  },
  {
    id: "3",
    name: "English Literature",
    code: "ENGL201",
    description: "Classic Literature Studies",
    instructor: "Dr. Williams",
    semesterId: "3"
  },
  {
    id: "4",
    name: "Chemistry 101",
    code: "CHEM101",
    description: "Introduction to Chemistry",
    instructor: "Prof. Brown",
    semesterId: "3"
  }
];

let tasksData: Task[] = [
  {
    id: "1",
    title: "Research Paper",
    course: "History 101",
    courseCode: "HIST101",
    taskType: "assignment",
    dueDate: "2025-03-10",
    status: "not-started",
    description: "Write a 10-page research paper on World War II"
  },
  {
    id: "2",
    title: "Math Problem Set",
    course: "Calculus II",
    courseCode: "MATH202",
    taskType: "assignment",
    dueDate: "2025-03-10",
    status: "in-progress",
    description: "Complete problems 1-20 in Chapter 5"
  },
  {
    id: "3",
    title: "Literature Review",
    course: "English Literature",
    courseCode: "ENGL201",
    taskType: "reading",
    dueDate: "2024-03-20",
    status: "not-started",
    description: "Review and analyze 'The Great Gatsby'"
  },
  {
    id: "4",
    title: "Lab Report",
    course: "Chemistry 101",
    courseCode: "CHEM101",
    taskType: "assignment",
    dueDate: "2024-03-15",
    status: "completed",
    description: "Write up results from the titration experiment"
  }
];

// Export functions to manage the mock data
export const mockDataManager = {
  getSemesters: () => semestersData,
  getCourses: () => coursesData,
  getTasks: () => tasksData,
  createSemester: (semester: Omit<Semester, 'id'>): Semester => {
    const newSemester = {
      ...semester,
      id: Math.random().toString(36).substr(2, 9)
    };
    semestersData.push(newSemester);
    return newSemester;
  },
  updateSemester: (semester: Semester): Semester => {
    semestersData = semestersData.map(s => 
      s.id === semester.id ? semester : s
    );
    return semester;
  },
  deleteSemester: (id: string): void => {
    semestersData = semestersData.filter(s => s.id !== id);
    // Also delete associated courses and tasks
    const coursesToDelete = coursesData.filter(c => c.semesterId === id);
    coursesData = coursesData.filter(c => c.semesterId !== id);
    coursesToDelete.forEach(course => {
      tasksData = tasksData.filter(t => t.courseCode !== course.code);
    });
  },
  createCourse: (course: Omit<Course, 'id'>): Course => {
    const newCourse = {
      ...course,
      id: Math.random().toString(36).substr(2, 9)
    };
    coursesData.push(newCourse);
    return newCourse;
  },
  updateCourse: (course: Course): Course => {
    coursesData = coursesData.map(c => 
      c.id === course.id ? course : c
    );
    return course;
  },
  deleteCourse: (id: string): void => {
    const course = coursesData.find(c => c.id === id);
    if (course) {
      coursesData = coursesData.filter(c => c.id !== id);
      tasksData = tasksData.filter(t => t.courseCode !== course.code);
    }
  },
  createTask: (task: Omit<Task, 'id'>): Task => {
    const newTask = {
      ...task,
      id: Math.random().toString(36).substr(2, 9)
    };
    tasksData.push(newTask);
    return newTask;
  },
  updateTask: (task: Task): Task => {
    tasksData = tasksData.map(t => 
      t.id === task.id ? task : t
    );
    return task;
  },
  deleteTask: (id: string): void => {
    tasksData = tasksData.filter(t => t.id !== id);
  }
};