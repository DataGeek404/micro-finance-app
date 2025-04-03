
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SMSTemplate } from './TemplateList';

interface TestSMSDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplate: SMSTemplate | null;
  phoneNumber: string;
  onPhoneNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: () => void;
  isSending: boolean;
}

const TestSMSDialog: React.FC<TestSMSDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedTemplate,
  phoneNumber,
  onPhoneNumberChange,
  onSend,
  isSending,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Test SMS</DialogTitle>
          <DialogDescription>
            Send a test message using this template
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="test-phone">Recipient Phone Number</Label>
            <Input
              id="test-phone"
              value={phoneNumber}
              onChange={onPhoneNumberChange}
              placeholder="+1234567890"
            />
            <p className="text-xs text-muted-foreground">
              Enter a valid phone number with country code (e.g., +1 for US)
            </p>
          </div>
          {selectedTemplate && (
            <div className="grid gap-2">
              <Label>Message Preview</Label>
              <div className="p-3 bg-slate-50 rounded-md text-sm">
                {selectedTemplate.content}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSend} disabled={isSending || !phoneNumber}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test SMS
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestSMSDialog;
