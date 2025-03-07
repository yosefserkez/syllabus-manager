"use client";

import { Calendar } from "@/components/ui/calendar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/lib/tasks";
import { format } from "date-fns";
import { X } from "lucide-react";
import { DayProps } from "react-day-picker";

export default function CalendarWithTasks() {
  const { tasks, selectedDate, setSelectedDate, getTasksForDate } = useTaskStore();

  // Custom day component to show task counts and hover details
  const DayWithTasks = (props: DayProps) => {
    const { date } = props;
    if (!date) return null;

    const tasksForDay = getTasksForDate(date);
    const hasTask = tasksForDay.length > 0;
    const isSelected = selectedDate && date.getTime() === selectedDate.getTime();

    return (
      <HoverCard openDelay={100} closeDelay={200}>
        <HoverCardTrigger asChild>
          <div
            className={`relative h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground grid place-content-center cursor-pointer transition-colors ${
              isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
            } ${hasTask ? "font-medium" : ""}`}
          >
            <time dateTime={format(date, "yyyy-MM-dd")}>{format(date, "d")}</time>
            {hasTask && (
              <Badge
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-4 w-4 flex items-center justify-center text-[10px] p-0"
              >
                {tasksForDay.length}
              </Badge>
            )}
          </div>
        </HoverCardTrigger>
        {hasTask && (
          <HoverCardContent 
            className="w-80 p-2" 
            align="start"
            side="right"
          >
            <div className="space-y-2">
              <h4 className="font-medium">
                {format(date, "MMMM d, yyyy")}
              </h4>
              <div className="space-y-1">
                {tasksForDay.map((task) => (
                  <div key={task.id} className="text-sm">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {task.course} • {task.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </HoverCardContent>
        )}
      </HoverCard>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Calendar</h3>
        {selectedDate && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => setSelectedDate(undefined)}
          >
            <X className="h-4 w-4 mr-1" />
            Clear filter
          </Button>
        )}
      </div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border"
        components={{
          Day: DayWithTasks
        }}
      />
    </div>
  );
}