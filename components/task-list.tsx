"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarDays, SortAsc, SortDesc, X, Clock, MoreVertical } from "lucide-react";
import { useTaskStore } from "@/lib/tasks";
import { Task, TaskType } from "@/lib/data";
import { format, parseISO, isAfter, isBefore, startOfDay, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getTaskTypeColor, getTaskDueStatus, getTaskStatusColor } from "@/lib/utils";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";

const STATUS_OPTIONS = [
  { value: "not-started", label: "Not Started", color: "border-gray-100 text-gray-800 dark:border-gray-800 dark:text-gray-200" },
  { value: "in-progress", label: "In Progress", color: "border-blue-100 text-blue-800 dark:border-blue-900 dark:text-blue-200" },
  { value: "completed", label: "Completed", color: "border-green-100 text-green-800 dark:border-green-900 dark:text-green-200" },
] as const;

const TASK_TYPE_OPTIONS = [
  { value: "assignment", label: "Assignment" },
  { value: "reading", label: "Reading" },
  { value: "test", label: "Test" },
  { value: "quiz", label: "Quiz" },
  { value: "project", label: "Project" },
  { value: "other", label: "Other" },
] as const;

const TIME_FILTER_OPTIONS = [
  { value: "all", label: "All Tasks" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past-due", label: "Past Due" },
  { value: "past", label: "Past" },
] as const;

export default function TaskList() {
  const { tasks, selectedDate, dateRange, setDateRange, getTasksForDate, getTasksInRange, updateTask } = useTaskStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [taskTypeFilter, setTaskTypeFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();

  const courses = Array.from(new Set(tasks.map(task => task.course)));

  const handleStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      try {
        await updateTask({ ...task, status: newStatus });
        toast({
          title: "Success",
          description: "Task status updated",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update task status",
          variant: "destructive",
        });
      }
    }
  };

  const handleTaskCompletion = (taskId: string, completed: boolean) => {
    handleStatusChange(taskId, completed ? "completed" : "not-started");
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleDateClick = (date: string) => {
    const clickedDate = parseISO(date);
    setDateRange({ 
      from: startOfDay(clickedDate),
      to: startOfDay(clickedDate)
    });
  };

  const handleTaskTypeClick = (type: TaskType) => {
    setTaskTypeFilter(type);
  };

  const handleCourseCodeClick = (course: string) => {
    setCourseFilter(course);
  };

  const getDateRangeText = () => {
    if (!dateRange?.from) return "Date range";
    if (!dateRange.to || isSameDay(dateRange.from, dateRange.to)) {
      return format(dateRange.from, "MMMM d, yyyy");
    }
    return `${format(dateRange.from, "LLL dd")} - ${format(dateRange.to, "LLL dd")}`;
  };

  let filteredTasks = selectedDate 
    ? getTasksForDate(selectedDate) 
    : (dateRange?.from && dateRange?.to) 
      ? getTasksInRange()
      : tasks;

  if (timeFilter !== "all") {
    const today = startOfDay(new Date());
    filteredTasks = filteredTasks.filter(task => {
      const dueDate = parseISO(task.dueDate);
      switch (timeFilter) {
        case "upcoming":
          return isAfter(dueDate, today);
        case "past-due":
          return isBefore(dueDate, today) && task.status !== "completed";
        case "past":
          return isBefore(dueDate, today);
        default:
          return true;
      }
    });
  }

  filteredTasks = filteredTasks
    .filter(task => statusFilter === "all" || task.status === statusFilter)
    .filter(task => courseFilter === "all" || task.course === courseFilter)
    .filter(task => taskTypeFilter === "all" || task.taskType === taskTypeFilter)
    .sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {getDateRangeText()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range: DateRange | undefined) => setDateRange(range)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {dateRange?.from && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDateRange(undefined)}
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by time" />
            </SelectTrigger>
            <SelectContent>
              {TIME_FILTER_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(course => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={taskTypeFilter} onValueChange={setTaskTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {TASK_TYPE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(prev => (prev === "asc" ? "desc" : "asc"))}
            title={sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
          >
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {dateRange?.from && (!dateRange.to || isSameDay(dateRange.from, dateRange.to))
              ? `No tasks due on ${format(dateRange.from, "MMMM d, yyyy")}`
              : dateRange?.from && dateRange?.to
              ? `No tasks due between ${format(dateRange.from, "MMMM d")} and ${format(dateRange.to, "MMMM d, yyyy")}`
              : "No tasks found"}
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const dueStatus = getTaskDueStatus(task.dueDate, task.status);
            const statusColor = getTaskStatusColor(dueStatus);
            const typeColors = getTaskTypeColor(task.taskType);
            const statusOption = STATUS_OPTIONS.find(s => s.value === task.status);
            
            return (
              <Card 
                key={task.id} 
                className={cn(
                  "p-4 transition-colors hover:shadow-md",
                  statusColor,
                  task.status === "completed" && "opacity-75"
                )}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={(checked) =>
                      handleTaskCompletion(task.id, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className={cn(
                          "font-medium truncate mb-1",
                          task.status === "completed" && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn(statusOption?.color, "border-2 bg-transparent hover:bg-transparent font-normal")}>
                          {statusOption?.label}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-0"
                          onClick={() => handleCourseCodeClick(task.course)}
                        >
                          <Badge 
                            variant="outline" 
                            className="cursor-pointer hover:bg-secondary"
                          >
                            {task.courseCode}
                          </Badge>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {STATUS_OPTIONS.map(option => (
                              <DropdownMenuItem 
                                key={option.value}
                                onSelect={() => handleStatusChange(task.id, option.value)}
                                disabled={task.status === option.value}
                              >
                                Mark as {option.label}
                              </DropdownMenuItem>
                            ))}
                            <TaskFormDialog mode="edit" task={task} />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center flex-wrap gap-3 text-sm text-muted-foreground">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-auto px-0 text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => handleDateClick(task.dueDate)}
                      >
                        <CalendarDays className="h-4 w-4 mr-1" />
                        {formatDate(task.dueDate)}
                      </Button>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {dueStatus === 'completed' ? 'Completed' : 
                         dueStatus === 'overdue' ? 'Overdue' :
                         dueStatus === 'due-today' ? 'Due Today' :
                         dueStatus === 'due-soon' ? 'Due Soon' : 'Upcoming'}
                      </div>
                      <span>•</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-0"
                        onClick={() => handleTaskTypeClick(task.taskType)}
                      >
                        <Badge 
                          variant="secondary"
                          className={cn(
                            typeColors.bg, 
                            typeColors.text,
                            "cursor-pointer hover:opacity-80"
                          )}
                        >
                          {TASK_TYPE_OPTIONS.find(t => t.value === task.taskType)?.label}
                        </Badge>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}