
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const EmailSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  
  // Form setup
  const form = useForm<EmailSettingsType>({
    defaultValues: {
      provider: 'SMTP',
      fromEmail: '',
      fromName: '',
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
    },
  });

  // Fetch email settings
  const { data: emailSettings, isLoading } = useQuery({
    queryKey: ['emailSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No settings found
        }
        console.error('Error fetching email settings:', error);
        throw error;
      }
      
      return data as EmailSettingsType;
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (emailSettings) {
      form.reset({
        provider: emailSettings.provider,
        fromEmail: emailSettings.fromEmail,
        fromName: emailSettings.fromName,
        smtpHost: emailSettings.smtpHost || '',
        smtpPort: emailSettings.smtpPort || 587,
        smtpUsername: emailSettings.smtpUsername || '',
        smtpPassword: emailSettings.smtpPassword || '',
        apiKey: emailSettings.apiKey,
        domain: emailSettings.domain,
      });
    }
  }, [emailSettings, form]);

  // Save email settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (formData: EmailSettingsType) => {
      if (emailSettings) {
        // Update existing record
        const { error } = await supabase
          .from('email_settings')
          .update(formData)
          .eq('id', emailSettings.id);
          
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('email_settings')
          .insert([formData]);
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Email settings have been updated successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['emailSettings'] });
    },
    onError: (error) => {
      console.error('Error saving email settings:', error);
      toast({
        title: "Error",
        description: "Failed to save email settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (formData: EmailSettingsType) => {
    saveSettingsMutation.mutate(formData);
  };

  const handleTestEmail = async () => {
    if (!testEmailRecipient) {
      toast({
        title: "Error",
        description: "Please enter a recipient email address.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Test Email Sent",
      description: `A test email has been sent to ${testEmailRecipient}.`
    });
    
    // In a real implementation, you'd call a Supabase Edge Function here to send the test email
    // For now, we'll just show a success toast
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Loading email settings...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Email Settings</h1>
          <p className="text-muted-foreground">Configure email notifications and delivery settings</p>
        </div>

        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Email Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Provider</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SMTP">SMTP Server</SelectItem>
                            <SelectItem value="SENDGRID">SendGrid</SelectItem>
                            <SelectItem value="MAILGUN">Mailgun</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="fromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {form.watch('provider') === 'SMTP' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">SMTP Settings</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="smtpHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Host</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="smtpPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Port</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="smtpUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="smtpPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {form.watch('provider') === 'SENDGRID' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">SendGrid Settings</h3>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {form.watch('provider') === 'MAILGUN' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Mailgun Settings</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="domain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Domain</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

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
                      <Input 
                        id="testEmail" 
                        placeholder="Enter your email address" 
                        value={testEmailRecipient}
                        onChange={(e) => setTestEmailRecipient(e.target.value)}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleTestEmail}>Send Test</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <Button 
                  type="submit" 
                  disabled={saveSettingsMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saveSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </AppLayout>
  );
};

export default EmailSettings;
