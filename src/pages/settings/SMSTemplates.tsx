
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search } from 'lucide-react';
import { UserRole } from '@/contexts/auth/types';
import { useAuth } from '@/contexts/auth';

// Import the refactored components
import TemplateList, { SMSTemplate } from '@/components/settings/sms/TemplateList';
import TemplateFormDialog, { variablePlaceholders } from '@/components/settings/sms/TemplateFormDialog';
import TestSMSDialog from '@/components/settings/sms/TestSMSDialog';

const SMSTemplates = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Test SMS dialog
  const [testSMSDialogOpen, setTestSMSDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SMSTemplate | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');

  // New template form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'transactional',
    is_active: true
  });

  // Edit template form
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<SMSTemplate | null>(null);

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sms_templates')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching SMS templates:', error);
      toast({
        title: "Error",
        description: "Failed to load SMS templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleNewTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTemplate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        title: "Required fields missing",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('sms_templates')
        .insert([newTemplate])
        .select('*')
        .single();
        
      if (error) throw error;
      
      setTemplates([data, ...templates]);
      setIsAddDialogOpen(false);
      setNewTemplate({
        name: '',
        content: '',
        category: 'transactional',
        is_active: true
      });
      
      toast({
        title: "Template created",
        description: "SMS template has been created successfully",
      });
    } catch (error) {
      console.error('Error adding SMS template:', error);
      toast({
        title: "Error",
        description: "Failed to create SMS template",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openEditDialog = (template: SMSTemplate) => {
    setEditTemplate(template);
    setIsEditDialogOpen(true);
  };

  const handleEditTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editTemplate) {
      setEditTemplate({
        ...editTemplate,
        [name]: value
      });
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editTemplate || !editTemplate.name || !editTemplate.content) {
      toast({
        title: "Required fields missing",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('sms_templates')
        .update({
          name: editTemplate.name,
          content: editTemplate.content,
          category: editTemplate.category,
          is_active: editTemplate.is_active
        })
        .eq('id', editTemplate.id);
        
      if (error) throw error;
      
      setTemplates(templates.map(t => 
        t.id === editTemplate.id ? editTemplate : t
      ));
      setIsEditDialogOpen(false);
      
      toast({
        title: "Template updated",
        description: "SMS template has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating SMS template:', error);
      toast({
        title: "Error",
        description: "Failed to update SMS template",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('sms_templates')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setTemplates(templates.filter(t => t.id !== id));
      
      toast({
        title: "Template deleted",
        description: "SMS template has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting SMS template:', error);
      toast({
        title: "Error",
        description: "Failed to delete SMS template",
        variant: "destructive"
      });
    }
  };

  const openTestSMSDialog = (template: SMSTemplate) => {
    setSelectedTemplate(template);
    setTestPhoneNumber('');
    setTestSMSDialogOpen(true);
  };

  const handleSendTestSMS = async () => {
    if (!selectedTemplate || !testPhoneNumber) {
      toast({
        title: "Required field missing",
        description: "Please enter a phone number",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      // Call the SMS edge function
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: testPhoneNumber,
          message: selectedTemplate.content
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Test SMS sent",
        description: "Message has been sent successfully"
      });
      
      setTestSMSDialogOpen(false);
    } catch (error) {
      console.error('Error sending test SMS:', error);
      toast({
        title: "Failed to send",
        description: "Could not send test SMS. Please check SMS settings.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const addVariable = (variable: string) => {
    if (isAddDialogOpen) {
      setNewTemplate({
        ...newTemplate,
        content: newTemplate.content + variable
      });
    } else if (isEditDialogOpen && editTemplate) {
      setEditTemplate({
        ...editTemplate,
        content: editTemplate.content + variable
      });
    }
  };

  // Check if user has admin privileges
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">SMS Templates</h1>
        <p className="text-muted-foreground">Manage templates for SMS communications</p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>SMS Templates</CardTitle>
            <CardDescription>Create and manage reusable SMS templates</CardDescription>
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} disabled={!isAdmin}>
              <Plus className="mr-2 h-4 w-4" />
              Add Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TemplateList 
            templates={templates}
            isLoading={isLoading}
            searchTerm={searchTerm}
            isAdmin={isAdmin}
            onTestSMS={openTestSMSDialog}
            onEdit={openEditDialog}
            onDelete={handleDeleteTemplate}
          />
        </CardContent>
      </Card>

      {/* Add Template Dialog */}
      <TemplateFormDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        isEdit={false}
        template={newTemplate}
        onChange={handleNewTemplateChange}
        onAddVariable={addVariable}
        onSave={handleAddTemplate}
        isSaving={isSaving}
      />

      {/* Edit Template Dialog */}
      {editTemplate && (
        <TemplateFormDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          isEdit={true}
          template={editTemplate}
          onChange={handleEditTemplateChange}
          onAddVariable={addVariable}
          onSave={handleUpdateTemplate}
          isSaving={isSaving}
        />
      )}

      {/* Test SMS Dialog */}
      <TestSMSDialog
        isOpen={testSMSDialogOpen}
        onOpenChange={setTestSMSDialogOpen}
        selectedTemplate={selectedTemplate}
        phoneNumber={testPhoneNumber}
        onPhoneNumberChange={(e) => setTestPhoneNumber(e.target.value)}
        onSend={handleSendTestSMS}
        isSending={isSending}
      />
    </AppLayout>
  );
};

export default SMSTemplates;
