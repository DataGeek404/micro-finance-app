
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SMSTemplate } from './TemplateList';

export const templateCategories = [
  { value: "transactional", label: "Transactional" },
  { value: "promotional", label: "Promotional" },
  { value: "reminder", label: "Reminder" },
  { value: "verification", label: "Verification" },
  { value: "other", label: "Other" },
];

export const variablePlaceholders = [
  { name: "{{client_name}}", description: "Client's full name" },
  { name: "{{loan_amount}}", description: "Loan amount" },
  { name: "{{payment_amount}}", description: "Payment amount" },
  { name: "{{payment_date}}", description: "Payment due date" },
  { name: "{{branch_name}}", description: "Branch name" },
  { name: "{{officer_name}}", description: "Loan officer name" },
];

interface TemplateFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEdit: boolean;
  template: {
    id?: string;
    name: string;
    content: string;
    category: string;
    is_active: boolean;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onAddVariable: (variable: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

const TemplateFormDialog: React.FC<TemplateFormDialogProps> = ({
  isOpen,
  onOpenChange,
  isEdit,
  template,
  onChange,
  onAddVariable,
  onSave,
  isSaving,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit SMS Template' : 'Create SMS Template'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update this SMS template' : 'Create a new template for SMS communications'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              name="name"
              value={template.name}
              onChange={onChange}
              placeholder="Payment Reminder"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              value={template.category}
              onChange={onChange}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {templateCategories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="content">Template Content</Label>
              <div className="text-xs text-muted-foreground">
                {template.content.length} characters
              </div>
            </div>
            <Textarea
              id="content"
              name="content"
              value={template.content}
              onChange={onChange}
              placeholder="Hello {{client_name}}, your payment of {{payment_amount}} is due on {{payment_date}}."
              rows={5}
            />
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Variables:</p>
              <div className="flex flex-wrap gap-2">
                {variablePlaceholders.map(variable => (
                  <Button
                    key={variable.name}
                    variant="outline"
                    size="sm"
                    onClick={() => onAddVariable(variable.name)}
                    title={variable.description}
                  >
                    {variable.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Updating...' : 'Saving...'}
              </>
            ) : isEdit ? 'Update Template' : 'Save Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateFormDialog;
