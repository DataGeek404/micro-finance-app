
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { SMSSettings as SMSSettingsType } from '@/types/settings';

const SMSSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [smsSettings, setSmsSettings] = useState<Partial<SMSSettingsType>>({
    provider: 'TWILIO',
    accountSid: '',
    authToken: '',
    fromNumber: '',
    apiKey: '',
    senderId: ''
  });
  
  const [testSMSDialogOpen, setTestSMSDialogOpen] = useState(false);
  const [testSMSData, setTestSMSData] = useState({
    to: '',
    message: 'This is a test SMS from LoanLight system.'
  });

  // Fetch SMS settings
  useEffect(() => {
    const fetchSMSSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('sms_settings')
          .select('*')
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setSmsSettings({
            provider: data.provider,
            accountSid: data.account_sid || '',
            authToken: data.auth_token || '',
            apiKey: data.api_key || '',
            fromNumber: data.from_number || '',
            senderId: data.sender_id || ''
          });
        }
      } catch (error) {
        console.error('Error fetching SMS settings:', error);
        toast({
          title: "Error",
          description: "Failed to load SMS settings",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSMSSettings();
  }, [toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSmsSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProviderChange = (value: string) => {
    setSmsSettings(prev => ({
      ...prev,
      provider: value as SMSSettingsType['provider']
    }));
  };
  
  const handleTestSMSInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTestSMSData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sms_settings')
        .select('id')
        .maybeSingle();
      
      if (error) throw error;
      
      // Convert provider to database format and map field names
      const settingsToSave = {
        provider: smsSettings.provider,
        account_sid: smsSettings.accountSid,
        auth_token: smsSettings.authToken,
        api_key: smsSettings.apiKey,
        from_number: smsSettings.fromNumber,
        sender_id: smsSettings.senderId
      };
      
      if (data) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('sms_settings')
          .update(settingsToSave)
          .eq('id', data.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new settings
        const { error: insertError } = await supabase
          .from('sms_settings')
          .insert([settingsToSave]);
          
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Settings saved",
        description: "SMS settings have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving SMS settings:', error);
      toast({
        title: "Save failed",
        description: "Could not save SMS settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestSMS = async () => {
    setIsTesting(true);
    try {
      // First, save the current settings
      await handleSave();
      
      // Open the test SMS dialog
      setTestSMSDialogOpen(true);
    } catch (error) {
      console.error('Error preparing test SMS:', error);
      toast({
        title: "Test failed",
        description: "Could not prepare test SMS. Please save your settings first.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleSendTestSMS = async () => {
    setIsTesting(true);
    try {
      // Call our edge function to send the test SMS
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: testSMSData.to,
          message: testSMSData.message
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Test SMS sent",
        description: "If your settings are correct, the SMS should be delivered shortly."
      });
      
      setTestSMSDialogOpen(false);
    } catch (error) {
      console.error('Error sending test SMS:', error);
      toast({
        title: "Test failed",
        description: "Could not send test SMS. Please check your settings.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">SMS Settings</h1>
        <p className="text-muted-foreground">Configure SMS gateway for client and staff communications</p>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-4">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to="/settings/sms/templates">
            <MessageSquare className="mr-2 h-4 w-4" />
            Manage SMS Templates
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>SMS Gateway Configuration</CardTitle>
          <CardDescription>Set up your SMS gateway provider to send messages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>SMS Provider</Label>
            <RadioGroup 
              value={smsSettings.provider} 
              onValueChange={handleProviderChange}
              className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="TWILIO" id="twilio" />
                <Label htmlFor="twilio" className="cursor-pointer">Twilio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="AFRICAS_TALKING" id="africas-talking" />
                <Label htmlFor="africas-talking" className="cursor-pointer">Africa's Talking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="NEXMO" id="nexmo" />
                <Label htmlFor="nexmo" className="cursor-pointer">Nexmo/Vonage</Label>
              </div>
            </RadioGroup>
          </div>
          
          {smsSettings.provider === 'TWILIO' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Twilio Settings</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="accountSid">Account SID</Label>
                  <Input 
                    id="accountSid"
                    name="accountSid"
                    value={smsSettings.accountSid} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authToken">Auth Token</Label>
                  <Input 
                    id="authToken"
                    name="authToken"
                    type="password"
                    value={smsSettings.authToken} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Your Twilio Auth Token"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromNumber">From Number</Label>
                  <Input 
                    id="fromNumber"
                    name="fromNumber"
                    value={smsSettings.fromNumber} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="+12345678901"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be a Twilio phone number in your account
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {smsSettings.provider === 'AFRICAS_TALKING' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Africa's Talking Settings</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input 
                    id="apiKey"
                    name="apiKey"
                    type="password"
                    value={smsSettings.apiKey} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Your API Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username"
                    name="username"
                    value={smsSettings.senderId} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Your Africa's Talking Username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromNumber">From Number/Shortcode</Label>
                  <Input 
                    id="fromNumber"
                    name="fromNumber"
                    value={smsSettings.fromNumber} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Your shortcode or sender ID"
                  />
                </div>
              </div>
            </div>
          )}
          
          {smsSettings.provider === 'NEXMO' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Nexmo/Vonage Settings</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input 
                    id="apiKey"
                    name="apiKey"
                    value={smsSettings.apiKey} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Your Nexmo API Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authToken">API Secret</Label>
                  <Input 
                    id="authToken"
                    name="authToken"
                    type="password"
                    value={smsSettings.authToken} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Your Nexmo API Secret"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromNumber">From Number/Sender ID</Label>
                  <Input 
                    id="fromNumber"
                    name="fromNumber"
                    value={smsSettings.fromNumber} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Your Nexmo Number or Sender ID"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">SMS Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Configure when SMS messages are sent to clients
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="loan-approval" defaultChecked />
              <Label htmlFor="loan-approval">Loan Approval</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="loan-disbursement" defaultChecked />
              <Label htmlFor="loan-disbursement">Loan Disbursement</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="payment-reminder" defaultChecked />
              <Label htmlFor="payment-reminder">Payment Reminder</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="payment-receipt" defaultChecked />
              <Label htmlFor="payment-receipt">Payment Receipt</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="late-payment" defaultChecked />
              <Label htmlFor="late-payment">Late Payment</Label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6">
            <Button
              variant="outline"
              type="button"
              onClick={handleTestSMS}
              disabled={isLoading || isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Test SMS
                </>
              )}
            </Button>
            
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={testSMSDialogOpen} onOpenChange={setTestSMSDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Send Test SMS</DialogTitle>
            <DialogDescription>
              Enter recipient information to send a test SMS using your current settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="to" className="text-right">
                To
              </Label>
              <Input
                id="to"
                name="to"
                value={testSMSData.to}
                onChange={handleTestSMSInputChange}
                className="col-span-3"
                placeholder="+12345678901"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Message
              </Label>
              <Input
                id="message"
                name="message"
                value={testSMSData.message}
                onChange={handleTestSMSInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestSMSDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendTestSMS} disabled={!testSMSData.to}>
              {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send Test SMS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SMSSettings;
