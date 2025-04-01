
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Mail, Send, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmailSettings as EmailSettingsType } from '@/types/settings';

const EmailSettings = () => {
  const { toast } = useToast();

  // Mock initial settings
  const initialSettings: EmailSettingsType = {
    provider: 'SMTP',
    fromEmail: 'notifications@loanlight.com',
    fromName: 'LoanLight Finance',
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: 'smtp_user',
    smtpPassword: '********',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "Email settings have been updated successfully."
    });
  };

  const handleTestEmail = () => {
    toast({
      title: "Test Email Sent",
      description: "A test email has been sent to your address."
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Email Settings</h1>
          <p className="text-muted-foreground">Configure email notifications and delivery settings</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Email Provider</Label>
                  <Select defaultValue={initialSettings.provider}>
                    <SelectTrigger id="provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMTP">SMTP Server</SelectItem>
                      <SelectItem value="SENDGRID">SendGrid</SelectItem>
                      <SelectItem value="MAILGUN">Mailgun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email Address</Label>
                    <Input id="fromEmail" defaultValue={initialSettings.fromEmail} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input id="fromName" defaultValue={initialSettings.fromName} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">SMTP Settings</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input id="smtpHost" defaultValue={initialSettings.smtpHost} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input id="smtpPort" type="number" defaultValue={initialSettings.smtpPort} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUsername">SMTP Username</Label>
                    <Input id="smtpUsername" defaultValue={initialSettings.smtpUsername} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input id="smtpPassword" type="password" defaultValue={initialSettings.smtpPassword} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Templates</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-muted rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Welcome Email</h4>
                        <p className="text-sm text-muted-foreground">Sent to new clients when they register</p>
                      </div>
                      <Button variant="outline" size="sm">Edit Template</Button>
                    </div>
                  </div>
                  <div className="bg-muted rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Loan Approval</h4>
                        <p className="text-sm text-muted-foreground">Sent when a loan is approved</p>
                      </div>
                      <Button variant="outline" size="sm">Edit Template</Button>
                    </div>
                  </div>
                  <div className="bg-muted rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Payment Reminder</h4>
                        <p className="text-sm text-muted-foreground">Sent before loan payments are due</p>
                      </div>
                      <Button variant="outline" size="sm">Edit Template</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-6 flex justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" type="button">
                    <Send className="mr-2 h-4 w-4" />
                    Test Email
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Send Test Email</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will send a test email to verify your email configuration. Enter the recipient email address below.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2 py-4">
                    <Label htmlFor="testEmail">Recipient Email</Label>
                    <Input id="testEmail" placeholder="Enter your email address" />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleTestEmail}>Send Test</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button type="submit">
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

export default EmailSettings;
