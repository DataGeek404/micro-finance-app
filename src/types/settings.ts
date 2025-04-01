
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
