
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

const EmailSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    provider: 'smtp',
    from_name: '',
    from_email: '',
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    api_key: '',
    domain: ''
  });
  
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false);
  const [testEmailData, setTestEmailData] = useState({
    to: '',
    subject: 'LoanLight Test Email',
    body: 'This is a test email from LoanLight system. If you are receiving this, your email configuration is working correctly.'
  });

  // Fetch email settings
  useEffect(() => {
    const fetchEmailSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('email_settings')
          .select('*')
          .maybeSingle();
          
        if (error) throw error;
        
        if (data) {
          setEmailSettings({
            provider: data.provider || 'smtp',
            from_name: data.from_name || '',
            from_email: data.from_email || '',
            smtp_host: data.smtp_host || '',
            smtp_port: data.smtp_port?.toString() || '587',
            smtp_username: data.smtp_username || '',
            smtp_password: data.smtp_password || '',
            api_key: data.api_key || '',
            domain: data.domain || ''
          });
        }
      } catch (error) {
        console.error('Error fetching email settings:', error);
        toast({
          title: "Error",
          description: "Failed to load email settings",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmailSettings();
  }, [toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProviderChange = (value: string) => {
    setEmailSettings(prev => ({
      ...prev,
      provider: value
    }));
  };

  const handleTestEmailInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTestEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Convert port to number
      const settingsToSave = {
        ...emailSettings,
        smtp_port: emailSettings.smtp_port ? parseInt(emailSettings.smtp_port) : null
      };
      
      const { data, error } = await supabase
        .from('email_settings')
        .select('id')
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('email_settings')
          .update(settingsToSave)
          .eq('id', data.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new settings
        const { error: insertError } = await supabase
          .from('email_settings')
          .insert([settingsToSave]);
          
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Settings saved",
        description: "Email settings have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving email settings:', error);
      toast({
        title: "Save failed",
        description: "Could not save email settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestEmail = async () => {
    setIsTesting(true);
    try {
      // First, save the current settings
      await handleSave();
      
      // Open the test email dialog
      setTestEmailDialogOpen(true);
    } catch (error) {
      console.error('Error preparing test email:', error);
      toast({
        title: "Test failed",
        description: "Could not prepare test email. Please save your settings first.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    setIsTesting(true);
    try {
      // Call our edge function to send the test email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmailData.to,
          subject: testEmailData.subject,
          body: testEmailData.body,
          from: `${emailSettings.from_name} <${emailSettings.from_email}>`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Test email sent",
        description: "If your settings are correct, you should receive the test email shortly."
      });
      
      setTestEmailDialogOpen(false);
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Test failed",
        description: "Could not send test email. Please check your settings.",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Email Settings</h1>
        <p className="text-muted-foreground">Configure how emails are sent to clients and users</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Provider Configuration</CardTitle>
          <CardDescription>Set up your email sending provider</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Email Provider</Label>
            <RadioGroup 
              value={emailSettings.provider} 
              onValueChange={handleProviderChange}
              className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="smtp" id="smtp" />
                <Label htmlFor="smtp" className="cursor-pointer">SMTP Server</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sendgrid" id="sendgrid" />
                <Label htmlFor="sendgrid" className="cursor-pointer">SendGrid</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mailgun" id="mailgun" />
                <Label htmlFor="mailgun" className="cursor-pointer">Mailgun</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from_name">From Name</Label>
              <Input 
                id="from_name"
                name="from_name"
                value={emailSettings.from_name} 
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Company Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from_email">From Email</Label>
              <Input 
                id="from_email"
                name="from_email"
                type="email"
                value={emailSettings.from_email} 
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="no-reply@yourdomain.com"
              />
            </div>
          </div>
          
          {emailSettings.provider === 'smtp' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">SMTP Settings</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input 
                    id="smtp_host"
                    name="smtp_host"
                    value={emailSettings.smtp_host} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input 
                    id="smtp_port"
                    name="smtp_port"
                    type="number"
                    value={emailSettings.smtp_port} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="587"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input 
                    id="smtp_username"
                    name="smtp_username"
                    value={emailSettings.smtp_username} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input 
                    id="smtp_password"
                    name="smtp_password"
                    type="password"
                    value={emailSettings.smtp_password} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          )}
          
          {emailSettings.provider === 'sendgrid' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">SendGrid Settings</h3>
              <div className="space-y-2">
                <Label htmlFor="api_key">API Key</Label>
                <Input 
                  id="api_key"
                  name="api_key"
                  value={emailSettings.api_key} 
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="SG.XXXXXXXX"
                  type="password"
                />
              </div>
            </div>
          )}
          
          {emailSettings.provider === 'mailgun' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Mailgun Settings</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="api_key">API Key</Label>
                  <Input 
                    id="api_key"
                    name="api_key"
                    value={emailSettings.api_key} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="key-XXXXXX"
                    type="password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <Input 
                    id="domain"
                    name="domain"
                    value={emailSettings.domain} 
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="mg.yourdomain.com"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Email Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Configure email templates for different notifications
                </p>
              </div>
              <Button variant="outline" disabled={isLoading}>
                <Pencil className="h-4 w-4 mr-2" />
                Manage Templates
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="welcome-email" defaultChecked />
              <Label htmlFor="welcome-email">Welcome Email</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="loan-approval" defaultChecked />
              <Label htmlFor="loan-approval">Loan Approval</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="payment-reminder" defaultChecked />
              <Label htmlFor="payment-reminder">Payment Reminder</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="payment-receipt" defaultChecked />
              <Label htmlFor="payment-receipt">Payment Receipt</Label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-6">
            <Button
              variant="outline"
              type="button"
              onClick={handleTestEmail}
              disabled={isLoading || isTesting || !emailSettings.from_email}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Test Email
                </>
              )}
            </Button>
            
            <Button
              type="button"
              onClick={handleSave}
              disabled={isLoading || !emailSettings.from_email}
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

      <Dialog open={testEmailDialogOpen} onOpenChange={setTestEmailDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Enter recipient information to send a test email using your current settings
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
                value={testEmailData.to}
                onChange={handleTestEmailInputChange}
                className="col-span-3"
                placeholder="recipient@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <Input
                id="subject"
                name="subject"
                value={testEmailData.subject}
                onChange={handleTestEmailInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="body" className="text-right">
                Message
              </Label>
              <Textarea
                id="body"
                name="body"
                value={testEmailData.body}
                onChange={handleTestEmailInputChange}
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendTestEmail} disabled={!testEmailData.to}>
              {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send Test Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default EmailSettings;
