export interface OrganizationSettings {
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  taxId?: string;
  currencyCode: string;
  fiscalYear: {
    startMonth: number;
    endMonth: number;
  };
}

export interface GeneralSettings {
  dateFormat: string;
  timeFormat: string;
  timezone: string;
  language: string;
}

export interface EmailSettings {
  provider: 'SMTP' | 'SENDGRID' | 'MAILGUN';
  fromEmail: string;
  fromName: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  apiKey?: string;
  domain?: string;
}

export interface DbEmailSettings {
  id: string;
  provider: string;
  from_email: string;
  from_name: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  api_key?: string;
  domain?: string;
  created_at: string;
  updated_at: string;
}

export interface SMSSettings {
  provider: 'TWILIO' | 'AFRICAS_TALKING' | 'NEXMO';
  accountSid?: string;
  authToken?: string;
  apiKey?: string;
  fromNumber?: string;
  senderId?: string;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  debugMode: boolean;
  maxFileUploadSize: number;
  allowedFileTypes: string[];
}
