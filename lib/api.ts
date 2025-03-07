import { Course, Task, Semester, mockDataManager } from './data';
import { supabase } from './supabase';
import { useAuth } from '@/hooks/use-auth';

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'An error occurred');
};

export const api = {
  semesters: {
    list: async (): Promise<Semester[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return mockDataManager.getSemesters();
      }

      const { data, error } = await supabase
        .from('semesters')
        .select('*')
        .eq('user_id', session.user.id)
        .order('start_date', { ascending: true });

      if (error) handleSupabaseError(error);
      return data?.map(semester => ({
        ...semester,
        startDate: semester.start_date,
        endDate: semester.end_date,
      })) || [];
    },
    create: async (semester: Omit<Semester, 'id'>): Promise<Semester> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('semesters')
        .insert({
          name: semester.name,
          start_date: semester.startDate,
          end_date: semester.endDate,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return {
        ...data,
        startDate: data.start_date,
        endDate: data.end_date,
      };
    },
    update: async (semester: Semester): Promise<Semester> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('semesters')
        .update({
          name: semester.name,
          start_date: semester.startDate,
          end_date: semester.endDate,
        })
        .eq('id', semester.id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return {
        ...data,
        startDate: data.start_date,
        endDate: data.end_date,
      };
    },
    delete: async (id: string): Promise<void> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const { error } = await supabase
        .from('semesters')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);
    },
  },
  courses: {
    list: async (): Promise<Course[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return mockDataManager.getCourses();
      }

      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          name,
          code,
          description,
          instructor,
          semester_id,
          created_at
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) handleSupabaseError(error);
      return data?.map(course => ({
        ...course,
        semesterId: course.semester_id
      })) || [];
    },
    create: async (course: Omit<Course, 'id'>): Promise<Course> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('courses')
        .insert({
          name: course.name,
          code: course.code,
          description: course.description,
          instructor: course.instructor,
          semester_id: course.semesterId,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return {
        ...data,
        semesterId: data.semester_id
      };
    },
    update: async (course: Course): Promise<Course> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase
        .from('courses')
        .update({
          name: course.name,
          code: course.code,
          description: course.description,
          instructor: course.instructor,
          semester_id: course.semesterId
        })
        .eq('id', course.id)
        .select()
        .single();

      if (error) handleSupabaseError(error);
      return {
        ...data,
        semesterId: data.semester_id
      };
    },
    delete: async (id: string): Promise<void> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);
    },
  },
  tasks: {
    list: async (): Promise<Task[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('user', session?.user);
      if (!session?.user) {
        return mockDataManager.getTasks();
      }

      const { data, error } = await supabase
        .from('tasks_with_courses')
        .select('*')
        .eq('user_id', session.user.id)
        .order('due_date', { ascending: true });

      if (error) handleSupabaseError(error);
      return data?.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        course: task.course_name,
        courseCode: task.course_code,
        taskType: task.task_type,
        dueDate: task.due_date,
        status: task.status
      })) || [];
    },
    create: async (task: Omit<Task, 'id'>): Promise<Task> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      // First, get the course_id from the course name
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('name', task.course)
        .single();

      if (courseError) handleSupabaseError(courseError);

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          course_id: courseData.id,
          task_type: task.taskType,
          due_date: task.dueDate,
          status: task.status,
          user_id: session.user.id,
        })
        .select(`
          *,
          courses (
            name,
            code
          )
        `)
        .single();

      if (error) handleSupabaseError(error);
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        course: data.courses.name,
        courseCode: data.courses.code,
        taskType: data.task_type,
        dueDate: data.due_date,
        status: data.status
      };
    },
    update: async (task: Task): Promise<Task> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      // First, get the course_id from the course name
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .eq('name', task.course)
        .single();

      if (courseError) handleSupabaseError(courseError);

      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: task.title,
          description: task.description,
          course_id: courseData.id,
          task_type: task.taskType,
          due_date: task.dueDate,
          status: task.status
        })
        .eq('id', task.id)
        .select(`
          *,
          courses (
            name,
            code
          )
        `)
        .single();

      if (error) handleSupabaseError(error);
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        course: data.courses.name,
        courseCode: data.courses.code,
        taskType: data.task_type,
        dueDate: data.due_date,
        status: data.status
      };
    },
    delete: async (id: string): Promise<void> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);
    },
  },
};