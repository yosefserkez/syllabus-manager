"use client";

import { create } from 'zustand';
import { Course, Semester } from '@/lib/data';
import { api } from '@/lib/api';

type CourseStore = {
  courses: Course[];
  semesters: Semester[];
  selectedSemester: string | null;
  setCourses: (courses: Course[]) => void;
  setSemesters: (semesters: Semester[]) => void;
  setSelectedSemester: (semesterId: string | null) => void;
  fetchCourses: () => Promise<void>;
  fetchSemesters: () => Promise<void>;
  createCourse: (course: Omit<Course, 'id'>) => Promise<Course>;
  updateCourse: (course: Course) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  createSemester: (semester: Omit<Semester, 'id'>) => Promise<Semester>;
  updateSemester: (semester: Semester) => Promise<void>;
  deleteSemester: (id: string) => Promise<void>;
  getCoursesForSemester: (semesterId: string) => Course[];
};

export const useCourseStore = create<CourseStore>((set, get) => ({
  courses: [],
  semesters: [],
  selectedSemester: null,
  setCourses: (courses) => set({ courses }),
  setSemesters: (semesters) => set({ semesters }),
  setSelectedSemester: (semesterId) => set({ selectedSemester: semesterId }),
  fetchCourses: async () => {
    const courses = await api.courses.list();
    set({ courses });
  },
  fetchSemesters: async () => {
    const semesters = await api.semesters.list();
    set({ semesters });
  },
  createCourse: async (course) => {
    const newCourse = await api.courses.create(course);
    const { courses } = get();
    set({ courses: [...courses, newCourse] });
    return newCourse;
  },
  updateCourse: async (course) => {
    const updatedCourse = await api.courses.update(course);
    const { courses } = get();
    set({ courses: courses.map(c => c.id === updatedCourse.id ? updatedCourse : c) });
  },
  deleteCourse: async (id) => {
    await api.courses.delete(id);
    const { courses } = get();
    set({ courses: courses.filter(c => c.id !== id) });
  },
  createSemester: async (semester) => {
    const newSemester = await api.semesters.create(semester);
    const { semesters } = get();
    set({ semesters: [...semesters, newSemester] });
    return newSemester;
  },
  updateSemester: async (semester) => {
    const updatedSemester = await api.semesters.update(semester);
    const { semesters } = get();
    set({ semesters: semesters.map(s => s.id === updatedSemester.id ? updatedSemester : s) });
  },
  deleteSemester: async (id) => {
    await api.semesters.delete(id);
    const { semesters } = get();
    set({ semesters: semesters.filter(s => s.id !== id) });
  },
  getCoursesForSemester: (semesterId) => {
    const { courses } = get();
    return courses.filter(course => course.semesterId === semesterId);
  },
}));