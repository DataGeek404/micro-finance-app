
-- Create SMS templates table
CREATE TABLE public.sms_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR NOT NULL DEFAULT 'transactional',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read SMS templates
CREATE POLICY "Authenticated users can view SMS templates" 
    ON public.sms_templates
    FOR SELECT
    TO authenticated
    USING (true);

-- Only allow administrators to modify SMS templates
CREATE POLICY "Administrators can insert SMS templates" 
    ON public.sms_templates
    FOR INSERT
    TO authenticated
    WITH CHECK (get_current_user_role() = 'ADMIN');

CREATE POLICY "Administrators can update SMS templates" 
    ON public.sms_templates
    FOR UPDATE
    TO authenticated
    USING (get_current_user_role() = 'ADMIN');

CREATE POLICY "Administrators can delete SMS templates" 
    ON public.sms_templates
    FOR DELETE
    TO authenticated
    USING (get_current_user_role() = 'ADMIN');

-- Add updated_at trigger
CREATE TRIGGER update_sms_templates_updated_at
    BEFORE UPDATE ON public.sms_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some default templates
INSERT INTO public.sms_templates (name, content, category, is_active)
VALUES 
    ('Payment Reminder', 'Dear {{client_name}}, this is a reminder that your payment of {{payment_amount}} is due on {{payment_date}}. Please ensure your account has sufficient funds. Thank you.', 'reminder', true),
    
    ('Loan Approval', 'Congratulations {{client_name}}! Your loan application for {{loan_amount}} has been approved. Visit our branch at {{branch_name}} for disbursement details.', 'transactional', true),
    
    ('Payment Confirmation', 'Dear {{client_name}}, we have received your payment of {{payment_amount}}. Thank you for your prompt payment. Your next payment is due on {{payment_date}}.', 'transactional', true),
    
    ('Late Payment Notice', 'Dear {{client_name}}, your payment of {{payment_amount}} was due on {{payment_date}} and is now overdue. Please make payment as soon as possible to avoid additional fees.', 'reminder', true),
    
    ('Account Verification', 'Your LoanLight verification code is: 123456. This code expires in 10 minutes. Do not share this code with anyone.', 'verification', true);
