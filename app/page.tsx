"use client";

import { Button } from "@/components/ui/button";
import { Upload, Calendar, CheckSquare, Bell } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-primary mb-6">
              Transform Your Syllabi into
              <span className="text-blue-600 dark:text-blue-400"> Actionable Tasks</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Upload your course syllabi and let our AI-powered platform organize your assignments, deadlines, and study schedule automatically.
            </p>
            <div className="flex justify-center gap-4">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    <Upload className="w-5 h-5" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth">
                    <Button size="lg" className="gap-2">
                      <Upload className="w-5 h-5" />
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" size="lg">
                      View Demo
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <Calendar className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Calendar Integration</h3>
              <p className="text-muted-foreground">
                Automatically sync your assignments and deadlines with your preferred calendar app.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <CheckSquare className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Task Management</h3>
              <p className="text-muted-foreground">
                Track your progress with intuitive task management and status updates.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <Bell className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Reminders</h3>
              <p className="text-muted-foreground">
                Get customizable notifications for upcoming deadlines and important milestones.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}