"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { NotificationPreferences, defaultNotificationPreferences } from "@/lib/email";
import { useAuth } from "@/hooks/use-auth";

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/settings');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Notification preferences updated successfully",
        });
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications for upcoming tasks
            </p>
          </div>
          <Switch
            checked={preferences.emailNotifications}
            onCheckedChange={(checked) =>
              setPreferences((prev) => ({ ...prev, emailNotifications: checked }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Digest Frequency</Label>
          <Select
            value={preferences.digestFrequency}
            onValueChange={(value: 'daily' | 'weekly') =>
              setPreferences((prev) => ({ ...prev, digestFrequency: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Digest Time</Label>
          <Input
            type="time"
            value={preferences.digestTime}
            onChange={(e) =>
              setPreferences((prev) => ({ ...prev, digestTime: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Upcoming Tasks Window (Days)</Label>
          <Input
            type="number"
            min="1"
            max="30"
            value={preferences.upcomingTasksWindow}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                upcomingTasksWindow: parseInt(e.target.value) || 7,
              }))
            }
          />
          <p className="text-sm text-muted-foreground">
            Show tasks due within this many days
          </p>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Preferences
        </Button>
      </div>
    </Card>
  );
}