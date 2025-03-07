"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskList from "@/components/task-list";
import UploadSection from "@/components/upload-section";
import { Card } from "@/components/ui/card";
import ProgressTracking from "@/components/progress-tracking";
import { CourseFormDialog } from "@/components/course-form-dialog";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { SemesterFormDialog } from "@/components/semester-form-dialog";
import { useTaskStore } from "@/lib/tasks";
import { useCourseStore } from "@/hooks/use-courses";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, Calendar, Search, Pencil, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { DemoBanner } from "@/components/demo-banner";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { fetchTasks } = useTaskStore();
  const { courses, semesters, fetchCourses, fetchSemesters } = useCourseStore();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchTasks();
    fetchCourses();
    fetchSemesters();
  }, [fetchTasks, fetchCourses, fetchSemesters]);

  // Filter and sort functions
  const filterCourses = () => {
    let filtered = [...courses];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.name.toLowerCase().includes(query) ||
        course.code.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.instructor?.toLowerCase().includes(query)
      );
    }

    if (semesterFilter !== "all") {
      filtered = filtered.filter(course => course.semesterId === semesterFilter);
    }

    return filtered.sort((a, b) => {
      const compareValue = sortOrder === "asc" 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
      return compareValue;
    });
  };

  const filterSemesters = () => {
    let filtered = [...semesters];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(semester => 
        semester.name.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {!user && <DemoBanner />}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-80 space-y-4">
              <ProgressTracking />
              <UploadSection />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <Tabs defaultValue="tasks" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="semesters">Semesters</TabsTrigger>
                </TabsList>
                <TabsContent value="tasks" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Tasks</h2>
                    <TaskFormDialog mode="create" />
                  </div>
                  <TaskList />
                </TabsContent>
                <TabsContent value="courses">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-semibold">Courses</h2>
                      <CourseFormDialog mode="create" />
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search courses..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Select
                        value={semesterFilter}
                        onValueChange={setSemesterFilter}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Filter by semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Semesters</SelectItem>
                          {semesters.map((semester) => (
                            <SelectItem key={semester.id} value={semester.id}>
                              {semester.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                      >
                        {sortOrder === "asc" ? "A-Z" : "Z-A"}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {filterCourses().map((course) => (
                        <Card 
                          key={course.id}
                          className="p-4 transition-colors hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium truncate">{course.name}</h3>
                                <Badge variant="outline" className="font-mono">
                                  {course.code}
                                </Badge>
                              </div>
                              {course.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {course.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {course.instructor && (
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>{course.instructor}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {semesters.find(s => s.id === course.semesterId)?.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4" />
                                  <span>3 Credits</span>
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <CourseFormDialog mode="edit" course={course} />
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="semesters">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-semibold">Semesters</h2>
                      <SemesterFormDialog mode="create" onSuccess={fetchSemesters} />
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search semesters..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                      >
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {filterSemesters().map((semester) => (
                        <Card 
                          key={semester.id}
                          className="p-4 transition-colors hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{semester.name}</h3>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {format(new Date(semester.startDate), "MMM d, yyyy")} - {format(new Date(semester.endDate), "MMM d, yyyy")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4" />
                                  <span>
                                    {courses.filter(c => c.semesterId === semester.id).length} Courses
                                  </span>
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <SemesterFormDialog 
                                  mode="edit" 
                                  semester={semester} 
                                  onSuccess={fetchSemesters}
                                />
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}