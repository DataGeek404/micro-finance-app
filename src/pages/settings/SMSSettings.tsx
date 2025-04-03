
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageSquare, Pencil } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const SMSSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [smsSettings, setSmsSettings] = useState({
    provider: 'twilio',
    account_sid: '',
    auth_token: '',
    from_number: '',
    api_key: '',
    sender_id: ''
  });

  const [testSmsDialogOpen, setTestSmsDialogOpen] = useState(false);
  const [testSmsData, setTestSmsData] = useState({
    to: '',
    message: 'This is a test SMS from LoanLight system. If you are receiving this, your SMS configuration is working correctly.'
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
            provider: data.provider || 'twilio',
            account_sid: data.account_sid || '',
            auth_token: data.auth_token || '',
            from_number: data.from_number || '',
            api_key: data.api_key || '',
            sender_id: data.sender_id || ''
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSmsSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProviderChange = (value: string) => {
    setSmsSettings(prev => ({
      ...prev,
      provider: value
    }));
  };

  const handleTestSmsInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTestSmsData(prev => ({
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
      
      if (data) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('sms_settings')
          .update(smsSettings)
          .eq('id', data.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new settings
        const { error: insertError } = await supabase
          .from('sms_settings')
          .insert([smsSettings]);
          
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
      setTestSmsDialogOpen(true);
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

  const handleSendTestSms = async () => {
    setIsTesting(true);
    try {
      // Call our edge function to send the test SMS
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: testSmsData.to,
          message: testSmsData.message
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Test SMS sent",
        description: "If your settings are correct, you should receive the test SMS shortly."
      });
      
      setTestSmsDialogOpen(false);
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
        <p className="text-muted-foreground">Configure how SMS messages are sent to clients</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>SMS Provider Configuration</CardTitle>
          <CardDescription>Set up your SMS sending provider</CardDescription>
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
                <RadioGroupItem value="twilio" id="twilio" />
                <Label htmlFor="twilio" className="cursor-pointer">Twilio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="africas_talking" id="africas_talking" />
                <Label htmlFor="africas_talking" className="cursor-pointer">Africa's Talking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer">Custom</Label>
              </div>
            </RadioGroup>
          </div>
          
          {smsSettings.provider === 'twilio' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Twilio Settings</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="account_sid">Account SID</Label>
                  <Input 
                    id="account_sid"
                    name="account_sid"
                    value={smsSettings.account_sid} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth_token">Auth Token</Label>
                  <Input 
                    id="auth_token"
                    name="auth_token"
                    type="password"
                    value={smsSettings.auth_token} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="from_number">From Number</Label>
                  <Input 
                    id="from_number"
                    name="from_number"
                    value={smsSettings.from_number} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>
          )}
          
          {smsSettings.provider === 'africas_talking' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Africa's Talking Settings</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="api_key">API Key</Label>
                  <Input 
                    id="api_key"
                    name="api_key"
                    type="password"
                    value={smsSettings.api_key} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender_id">Sender ID</Label>
                  <Input 
                    id="sender_id"
                    name="sender_id"
                    value={smsSettings.sender_id} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Your sender ID"
                  />
                </div>
              </div>
            </div>
          )}
          
          {smsSettings.provider === 'custom' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Custom API Settings</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="api_key">API Key</Label>
                  <Input 
                    id="api_key"
                    name="api_key"
                    type="password"
                    value={smsSettings.api_key} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender_id">Sender ID</Label>
                  <Input 
                    id="sender_id"
                    name="sender_id"
                    value={smsSettings.sender_id} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Your sender ID"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">SMS Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Configure SMS templates for different notifications
                </p>
              </div>
              <Button variant="outline" disabled={isLoading}>
                <Pencil className="h-4 w-4 mr-2" />
                Manage Templates
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="loan-approval-sms" defaultChecked />
              <Label htmlFor="loan-approval-sms">Loan Approval</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="payment-reminder-sms" defaultChecked />
              <Label htmlFor="payment-reminder-sms">Payment Reminder</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="payment-receipt-sms" defaultChecked />
              <Label htmlFor="payment-receipt-sms">Payment Receipt</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="loan-disbursement-sms" defaultChecked />
              <Label htmlFor="loan-disbursement-sms">Loan Disbursement</Label>
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
                  <MessageSquare className="mr-2 h-4 w-4" />
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

      <Dialog open={testSmsDialogOpen} onOpenChange={setTestSmsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Send Test SMS</DialogTitle>
            <DialogDescription>
              Enter recipient phone number to send a test SMS using your current settings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="to" className="text-right">
                Phone Number
              </Label>
              <Input
                id="to"
                name="to"
                value={testSmsData.to}
                onChange={handleTestSmsInputChange}
                className="col-span-3"
                placeholder="+1234567890"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Message
              </Label>
              <Textarea
                id="message"
                name="message"
                value={testSmsData.message}
                onChange={handleTestSmsInputChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestSmsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendTestSms} disabled={!testSmsData.to}>
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
