"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil } from "lucide-react";
import { useTaskStore } from "@/lib/tasks";
import { useCourseStore } from "@/hooks/use-courses";
import { Task, TaskType } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

type TaskFormProps = {
  task?: Task;
  mode: "create" | "edit";
};

const STATUS_OPTIONS = [
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
] as const;

const TASK_TYPE_OPTIONS = [
  { value: "assignment", label: "Assignment" },
  { value: "reading", label: "Reading" },
  { value: "test", label: "Test" },
  { value: "quiz", label: "Quiz" },
  { value: "project", label: "Project" },
  { value: "other", label: "Other" },
] as const;

const initialState = {
  title: "",
  description: "",
  course: "",
  courseCode: "",
  taskType: "assignment" as TaskType,
  dueDate: format(new Date(), "yyyy-MM-dd"),
  status: "not-started" as Task["status"]
};

export function TaskFormDialog({ task, mode }: TaskFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const { createTask, updateTask, deleteTask, fetchTasks } = useTaskStore();
  const { courses } = useCourseStore();
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        course: task.course,
        courseCode: task.courseCode,
        taskType: task.taskType,
        dueDate: format(parseISO(task.dueDate), "yyyy-MM-dd"),
        status: task.status
      });
    } else {
      setFormData(initialState);
    }
  }, [task, open]);

  const handleAuthRequired = () => {
    toast({
      title: "Authentication Required",
      description: "Please sign in to manage tasks",
    });
    router.push("/auth");
  };

  const resetForm = () => {
    setFormData(initialState);
  };

  const handleCourseChange = (courseName: string) => {
    const selectedCourse = courses.find(c => c.name === courseName);
    setFormData(prev => ({
      ...prev,
      course: courseName,
      courseCode: selectedCourse?.code || ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleAuthRequired();
      return;
    }

    try {
      const taskData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString().split('T')[0]
      };

      if (mode === "create") {
        await createTask(taskData);
        toast({
          title: "Success",
          description: "Task created successfully",
        });
      } else if (task) {
        await updateTask({ ...task, ...taskData });
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      }
      
      await fetchTasks();
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save task:', error);
      toast({
        title: "Error",
        description: "Failed to save task",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!user) {
      handleAuthRequired();
      return;
    }

    try {
      if (task) {
        await deleteTask(task.id);
        toast({
          title: "Success",
          description: "Task deleted successfully",
        });
        await fetchTasks();
        setOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (isOpen && !user) {
        handleAuthRequired();
        return;
      }
      setOpen(isOpen);
      if (!isOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Task" : "Edit Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select 
              value={formData.course} 
              onValueChange={handleCourseChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.name}>
                    {course.name} ({course.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="taskType">Task Type</Label>
            <Select 
              value={formData.taskType} 
              onValueChange={(value: TaskType) => setFormData(prev => ({ ...prev, taskType: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: Task["status"]) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            {mode === "edit" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive">
                    Delete Task
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this task.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={() => {
                setOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === "create" ? "Create Task" : "Update Task"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}