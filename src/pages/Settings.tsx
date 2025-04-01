
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully"
    });
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Configure general system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app-name">Application Name</Label>
                  <Input id="app-name" value="LoanLight" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <select 
                    id="date-format" 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <select 
                    id="timezone" 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Standard Time (EST)</option>
                    <option value="CST">Central Standard Time (CST)</option>
                    <option value="PST">Pacific Standard Time (PST)</option>
                  </select>
                </div>
                <div className="flex items-center justify-between space-y-0 pt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-logout">Auto Logout</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically log out after 30 minutes of inactivity
                    </p>
                  </div>
                  <Switch id="auto-logout" defaultChecked />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Loan Settings</CardTitle>
                <CardDescription>Configure default loan parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="default-interest">Default Interest Rate (%)</Label>
                    <Input id="default-interest" type="number" value="12.5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-term">Default Loan Term (months)</Label>
                    <Input id="default-term" type="number" value="12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="late-fee">Late Payment Fee (%)</Label>
                    <Input id="late-fee" type="number" value="2" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grace-period">Grace Period (days)</Label>
                    <Input id="grace-period" type="number" value="3" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-approval">Require Loan Approval</Label>
                    <p className="text-xs text-muted-foreground">
                      All loans require manager approval before disbursement
                    </p>
                  </div>
                  <Switch id="require-approval" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Update your organization information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" value="MicroFinance Solutions Ltd." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-address">Address</Label>
                <Input id="org-address" value="123 Finance Street, Suite 500" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org-city">City</Label>
                  <Input id="org-city" value="New York" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-country">Country</Label>
                  <Input id="org-country" value="United States" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-phone">Phone</Label>
                  <Input id="org-phone" value="555-123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-email">Email</Label>
                  <Input id="org-email" type="email" value="info@microfinance.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-website">Website</Label>
                <Input id="org-website" value="https://microfinance.com" />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSave}>Save Organization Info</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    <p className="text-xs text-muted-foreground">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-sm font-medium">SMS Notifications</h3>
                    <p className="text-xs text-muted-foreground">
                      Receive SMS notifications for critical alerts
                    </p>
                  </div>
                  <Switch id="sms-notifications" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-sm font-medium">Loan Application Alerts</h3>
                    <p className="text-xs text-muted-foreground">
                      Be notified when new loan applications are submitted
                    </p>
                  </div>
                  <Switch id="loan-applications" defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-sm font-medium">Payment Reminders</h3>
                    <p className="text-xs text-muted-foreground">
                      Send automatic payment reminders to clients
                    </p>
                  </div>
                  <Switch id="payment-reminders" defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h3 className="text-sm font-medium">System Reports</h3>
                    <p className="text-xs text-muted-foreground">
                      Receive periodic system reports and analytics
                    </p>
                  </div>
                  <Switch id="system-reports" defaultChecked />
                </div>
                <div className="space-y-2 pt-4">
                  <Label htmlFor="notification-email">Notification Email</Label>
                  <Input id="notification-email" type="email" value="admin@microfinance.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notification-phone">Notification Phone</Label>
                  <Input id="notification-phone" value="555-123-4567" />
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave}>Save Notification Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
