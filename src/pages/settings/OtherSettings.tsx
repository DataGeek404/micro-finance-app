
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OtherSettings = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Other settings have been updated successfully."
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Other Settings</h1>
          <p className="text-muted-foreground">Additional configuration options</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MoreHorizontal className="mr-2 h-5 w-5" />
                Additional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Default Settings</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="defaultBranch">Default Branch</Label>
                    <Select>
                      <SelectTrigger id="defaultBranch">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Main Branch</SelectItem>
                        <SelectItem value="2">North Branch</SelectItem>
                        <SelectItem value="3">South Branch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultLoanType">Default Loan Product</Label>
                    <Select>
                      <SelectTrigger id="defaultLoanType">
                        <SelectValue placeholder="Select loan product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Business Loan</SelectItem>
                        <SelectItem value="2">Personal Loan</SelectItem>
                        <SelectItem value="3">Home Loan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Preferences</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="browserNotifications">Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show browser notifications for important events
                      </p>
                    </div>
                    <Switch id="browserNotifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="soundAlerts">Sound Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Play sound when notifications are received
                      </p>
                    </div>
                    <Switch id="soundAlerts" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Privacy Settings</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="analytics">Usage Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow collection of anonymized usage data to improve the system
                      </p>
                    </div>
                    <Switch id="analytics" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="crashReporting">Crash Reporting</Label>
                      <p className="text-sm text-muted-foreground">
                        Send error reports automatically to improve stability
                      </p>
                    </div>
                    <Switch id="crashReporting" defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Accessibility</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="highContrast">High Contrast Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Use higher contrast colors for better visibility
                      </p>
                    </div>
                    <Switch id="highContrast" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="largerText">Larger Text</Label>
                      <p className="text-sm text-muted-foreground">
                        Increase text size throughout the application
                      </p>
                    </div>
                    <Switch id="largerText" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Integration Keys</h3>
                <div className="space-y-2">
                  <Label htmlFor="googleMapsKey">Google Maps API Key</Label>
                  <Input id="googleMapsKey" placeholder="Enter API key" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used for location services and mapping features
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-6">
              <Button type="submit" className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default OtherSettings;
