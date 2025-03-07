"use client";

import { useTaskStore } from "@/lib/tasks";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCourseStore } from "@/hooks/use-courses";
import { getTaskTypeColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { parseISO, isAfter, isBefore, startOfDay } from "date-fns";

export default function ProgressTracking() {
  const { tasks } = useTaskStore();
  const { courses } = useCourseStore();

  const today = startOfDay(new Date());
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const overdueTasks = tasks.filter(task => 
    task.status !== "completed" && 
    isBefore(parseISO(task.dueDate), today)
  ).length;

  const upcomingTasks = tasks.filter(task => 
    task.status !== "completed" && 
    isAfter(parseISO(task.dueDate), today)
  ).length;

  // Group tasks by type
  const tasksByType = tasks.reduce((acc, task) => {
    acc[task.taskType] = (acc[task.taskType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate completion rate by course
  const courseProgress = courses.map(course => {
    const courseTasks = tasks.filter(task => task.courseCode === course.code);
    const courseCompleted = courseTasks.filter(task => task.status === "completed").length;
    const total = courseTasks.length;
    return {
      code: course.code,
      name: course.name,
      progress: total ? Math.round((courseCompleted / total) * 100) : 0,
      total,
      completed: courseCompleted
    };
  }).filter(course => course.total > 0);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-medium mb-4">Overall Progress</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completion Rate</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div className="space-y-0.5">
                <div className="text-sm font-medium">{upcomingTasks}</div>
                <div className="text-xs text-muted-foreground">Upcoming</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <div className="space-y-0.5">
                <div className="text-sm font-medium">{overdueTasks}</div>
                <div className="text-xs text-muted-foreground">Overdue</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-4">Course Progress</h3>
        <div className="space-y-3">
          {courseProgress.map(course => (
            <div key={course.code} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{course.code}</span>
                  <span className="text-muted-foreground">
                    ({course.completed}/{course.total})
                  </span>
                </div>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-4">Tasks by Type</h3>
        <div className="space-y-2">
          {Object.entries(tasksByType).map(([type, count]) => {
            const colors = getTaskTypeColor(type as any);
            return (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", colors.bg)} />
                  <span className="text-sm capitalize">{type}</span>
                </div>
                <span className="text-sm font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}