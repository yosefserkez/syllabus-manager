"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil } from "lucide-react";
import { Semester } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { api } from "@/lib/api";

type SemesterFormProps = {
  semester?: Semester;
  mode: "create" | "edit";
  onSuccess?: () => void;
};

export function SemesterFormDialog({ semester, mode, onSuccess }: SemesterFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(semester?.name || "");
  const [startDate, setStartDate] = useState(
    semester?.startDate ? format(new Date(semester.startDate), "yyyy-MM-dd") : ""
  );
  const [endDate, setEndDate] = useState(
    semester?.endDate ? format(new Date(semester.endDate), "yyyy-MM-dd") : ""
  );
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const handleAuthRequired = () => {
    toast({
      title: "Authentication Required",
      description: "Please sign in to manage semesters",
    });
    router.push("/auth");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleAuthRequired();
      return;
    }

    try {
      if (mode === "create") {
        await api.semesters.create({ name, startDate, endDate });
        toast({
          title: "Success",
          description: "Semester created successfully",
        });
      } else if (semester) {
        await api.semesters.update({ ...semester, name, startDate, endDate });
        toast({
          title: "Success",
          description: "Semester updated successfully",
        });
      }
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save semester",
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
      if (semester) {
        await api.semesters.delete(semester.id);
        toast({
          title: "Success",
          description: "Semester deleted successfully",
        });
        setOpen(false);
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete semester",
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
    }}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Semester
          </Button>
        ) : (
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Semester" : "Edit Semester"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Semester Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Spring 2024"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-between">
            {mode === "edit" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive">
                    Delete Semester
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this semester
                      and all associated courses and tasks.
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {mode === "create" ? "Create Semester" : "Update Semester"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}