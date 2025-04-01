
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
import { MessageSquare, Send, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SMSSettings as SMSSettingsType } from '@/types/settings';

const SMSSettings = () => {
  const { toast } = useToast();

  // Mock initial settings
  const initialSettings: SMSSettingsType = {
    provider: 'TWILIO',
    accountSid: 'AC1234567890abcdef1234567890abcdef',
    authToken: '********',
    fromNumber: '+12025550142',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Settings Saved",
      description: "SMS settings have been updated successfully."
    });
  };

  const handleTestSMS = () => {
    toast({
      title: "Test SMS Sent",
      description: "A test SMS has been sent to the phone number."
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">SMS Settings</h1>
          <p className="text-muted-foreground">Configure SMS notifications and delivery settings</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                SMS Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">SMS Provider</Label>
                  <Select defaultValue={initialSettings.provider}>
                    <SelectTrigger id="provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TWILIO">Twilio</SelectItem>
                      <SelectItem value="AFRICAS_TALKING">Africa's Talking</SelectItem>
                      <SelectItem value="NEXMO">Vonage (Nexmo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="accountSid">Account SID / API Key</Label>
                    <Input id="accountSid" defaultValue={initialSettings.accountSid} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authToken">Auth Token / API Secret</Label>
                    <Input id="authToken" type="password" defaultValue={initialSettings.authToken} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromNumber">From Number / Sender ID</Label>
                    <Input id="fromNumber" defaultValue={initialSettings.fromNumber} />
                    <p className="text-xs text-muted-foreground mt-1">
                      Phone number or sender ID that will appear as the sender
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">SMS Templates</h3>
                <div className="grid grid-cols-1 gap-4">
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
                  <div className="bg-muted rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Payment Confirmation</h4>
                        <p className="text-sm text-muted-foreground">Sent when a payment is received</p>
                      </div>
                      <Button variant="outline" size="sm">Edit Template</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">SMS Notification Settings</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="loan-approval" defaultChecked />
                    <Label htmlFor="loan-approval">Send SMS on loan approval</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="payment-reminder" defaultChecked />
                    <Label htmlFor="payment-reminder">Send payment reminders</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="payment-received" defaultChecked />
                    <Label htmlFor="payment-received">Send payment receipts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="loan-disbursement" defaultChecked />
                    <Label htmlFor="loan-disbursement">Send disbursement notifications</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-6 flex justify-between">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" type="button">
                    <Send className="mr-2 h-4 w-4" />
                    Test SMS
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Send Test SMS</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will send a test SMS to verify your configuration. Enter the recipient phone number below.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2 py-4">
                    <Label htmlFor="testPhone">Phone Number</Label>
                    <Input id="testPhone" placeholder="e.g. +1234567890" />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleTestSMS}>Send Test</AlertDialogAction>
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

export default SMSSettings;
