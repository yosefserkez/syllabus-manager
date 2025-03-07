import { create } from 'zustand';
import { Task } from './data';
import { api } from './api';
import { endOfDay, startOfDay, parseISO } from 'date-fns';
import { DateRange } from 'react-day-picker';

type TaskStore = {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  getTasksForDate: (date: Date) => Task[];
  getTasksInRange: () => Task[];
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  selectedDate: undefined,
  setSelectedDate: (date) => {
    set({ selectedDate: date, dateRange: undefined });
  },
  dateRange: undefined,
  setDateRange: (range) => {
    if (!range) {
      set({ 
        dateRange: undefined, 
        selectedDate: undefined 
      });
      return;
    }

    // If only from is set, use it for both from and to
    if (range.from && !range.to) {
      set({ 
        dateRange: { from: range.from, to: range.from },
        selectedDate: undefined 
      });
      return;
    }

    set({ 
      dateRange: range,
      selectedDate: undefined 
    });
  },
  getTasksForDate: (date: Date) => {
    if (!date) return [];
    const { tasks } = get();
    const start = startOfDay(date);
    const end = endOfDay(date);
    
    return tasks.filter((task) => {
      const taskDate = startOfDay(parseISO(task.dueDate));
      return taskDate.getTime() === start.getTime();
    });
  },
  getTasksInRange: () => {
    const { tasks, dateRange } = get();
    if (!dateRange?.from || !dateRange?.to) return tasks;
    
    const start = startOfDay(dateRange.from);
    const end = endOfDay(dateRange.to);
    
    return tasks.filter((task) => {
      const taskDate = startOfDay(parseISO(task.dueDate));
      return taskDate >= start && taskDate <= end;
    });
  },
  fetchTasks: async () => {
    const tasks = await api.tasks.list();
    set({ tasks });
  },
  createTask: async (task) => {
    const newTask = await api.tasks.create(task);
    const { tasks } = get();
    set({ tasks: [...tasks, newTask] });
  },
  updateTask: async (task) => {
    const updatedTask = await api.tasks.update(task);
    const { tasks } = get();
    set({ tasks: tasks.map(t => t.id === updatedTask.id ? updatedTask : t) });
  },
  deleteTask: async (id) => {
    await api.tasks.delete(id);
    const { tasks } = get();
    set({ tasks: tasks.filter(t => t.id !== id) });
  },
}));