"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { extractTextFromFile, parseSyllabusWithAI, validateParsedData } from "@/lib/parser";
import { useToast } from "@/hooks/use-toast";
import { useCourseStore } from "@/hooks/use-courses";
import { useTaskStore } from "@/lib/tasks";
import { SyllabusData } from "@/lib/schemas";
import { semesterSchema, courseSchema } from "@/lib/data";

export default function UploadSection() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parseResult, setParseResult] = useState<{
    data: Partial<SyllabusData>;
    missingFields: string[];
  } | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { courses, semesters, createCourse, createSemester, fetchCourses, fetchSemesters } = useCourseStore();
  const { tasks, createTask, fetchTasks } = useTaskStore();

  const getMissingFields = (data: any): string[] => {
    const missingFields: string[] = [];
    
    // Check semester fields
    if (!data.semester?.name) missingFields.push("Semester name");
    if (!data.semester?.startDate) missingFields.push("Semester start date");
    if (!data.semester?.endDate) missingFields.push("Semester end date");
    
    // Check course fields
    if (!data.course?.name) missingFields.push("Course name");
    if (!data.course?.code) missingFields.push("Course code");
    
    // Check tasks
    data.tasks?.forEach((task: any, index: number) => {
      if (!task.title) missingFields.push(`Task ${index + 1} title`);
      if (!task.taskType) missingFields.push(`Task ${index + 1} type`);
      if (!task.dueDate) missingFields.push(`Task ${index + 1} due date`);
    });
    
    return missingFields;
  };

  const checkForDuplicates = (parsedData: Partial<SyllabusData>) => {
    const duplicates = {
      semester: false,
      course: false,
      tasks: [] as number[]
    };

    // Check for duplicate semester
    if (parsedData.semester?.name && parsedData.semester?.startDate && parsedData.semester?.endDate) {
      duplicates.semester = semesters.some(s => 
        s.name === parsedData.semester?.name &&
        s.startDate === parsedData.semester?.startDate &&
        s.endDate === parsedData.semester?.endDate
      );
    }

    // Check for duplicate course
    if (parsedData.course?.code) {
      duplicates.course = courses.some(c => c.code === parsedData.course?.code);
    }

    // Check for duplicate tasks
    parsedData.tasks?.forEach((task, index) => {
      if (task.title && task.dueDate) {
        const isDuplicate = tasks.some(t => 
          t.title.toLowerCase() === task.title?.toLowerCase() &&
          t.dueDate === task.dueDate
        );
        if (isDuplicate) {
          duplicates.tasks.push(index);
        }
      }
    });

    return duplicates;
  };

  const processFile = async (file: File) => {
    try {
      // Extract text from file
      setProgress(20);
      const text = await extractTextFromFile(file);

      // Parse with AI
      setProgress(40);
      const parsedData = await parseSyllabusWithAI(text);

      // Get missing fields
      const missingFields = getMissingFields(parsedData);
      setParseResult({ data: parsedData, missingFields });

      // Check for duplicates
      const duplicates = checkForDuplicates(parsedData);

      // Validate parsed data
      setProgress(60);
      const errors = validateParsedData(parsedData);
      if (errors.length > 0) {
        throw new Error(`Validation errors:\n${errors.join('\n')}`);
      }

      // Create semester if it doesn't exist
      setProgress(70);
      let semesterId = "";
      if (parsedData.semester && 
          semesterSchema.safeParse(parsedData.semester).success && 
          !duplicates.semester) {
        const semester = await createSemester(parsedData.semester);
        semesterId = semester.id;
      } else if (parsedData.semester?.name) {
        // Find existing semester
        const existingSemester = semesters.find(s => 
          s.name === parsedData.semester?.name &&
          s.startDate === parsedData.semester?.startDate &&
          s.endDate === parsedData.semester?.endDate
        );
        if (existingSemester) {
          semesterId = existingSemester.id;
        }
      }

      // Create course if it doesn't exist
      setProgress(80);
      if (parsedData.course && 
          courseSchema.safeParse(parsedData.course).success && 
          !duplicates.course && 
          semesterId) {
        await createCourse({
          ...parsedData.course,
          semesterId
        });
      }

      // Create non-duplicate tasks
      setProgress(90);
      let createdTasks = 0;
      if (parsedData.tasks) {
        for (const [index, task] of Array.from(parsedData.tasks.entries())) {
          if (
            task.title && 
            task.taskType && 
            task.dueDate && 
            !duplicates.tasks.includes(index)
          ) {
            await createTask({
              ...task,
              course: parsedData.course?.name || "Unknown Course",
              courseCode: parsedData.course?.code || "UNKNOWN",
              description: task.description || "",
              status: "not-started"
            });
            createdTasks++;
          }
        }
      }

      // Refresh data
      setProgress(100);
      await Promise.all([
        fetchSemesters(),
        fetchCourses(),
        fetchTasks()
      ]);

      // Show appropriate success message
      const duplicateMessage = duplicates.semester || duplicates.course || duplicates.tasks.length > 0
        ? " Some items were skipped as duplicates."
        : "";

      toast({
        title: "Success",
        description: missingFields.length > 0 
          ? `Syllabus processed with some missing information.${duplicateMessage}`
          : `Syllabus processed successfully.${duplicateMessage}`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process syllabus",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!user) {
      router.push("/auth");
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      setIsProcessing(true);
      setParseResult(null);
      processFile(file);
    }
  }, [user, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: false
  });

  if (!user) {
    return (
      <Card className="p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Please sign in to upload syllabi</span>
            <Button onClick={() => router.push("/auth")}>
              Sign In
            </Button>
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
      >
        <input {...getInputProps()} />
        {isProcessing ? (
          <div className="space-y-4">
            <FileText className="w-10 h-10 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-sm text-muted-foreground">Processing document...</p>
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-sm text-muted-foreground">Drop your syllabus here</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Drag & drop your syllabus here, or click to select
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Supports PDF, Word, and text files
            </p>
          </>
        )}
      </div>

      {parseResult && parseResult.missingFields.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing Information</AlertTitle>
          <AlertDescription>
            <p>The following information could not be extracted:</p>
            <ul className="list-disc list-inside mt-2">
              {parseResult.missingFields.map((field, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {field}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}