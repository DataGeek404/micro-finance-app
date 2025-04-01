
export interface Payroll {
  id: string;
  name: string;
  period: string;
  startDate: Date;
  endDate: Date;
  status: PayrollStatus;
  totalAmount: number;
  branchId: string;
  createdAt: Date;
  updatedAt: Date;
  items?: PayrollItem[];
}

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export interface PayrollItem {
  id: string;
  payrollId: string;
  employeeId: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate?: Date;
  paymentMethod?: string;
  paymentReference?: string;
  status: 'PENDING' | 'PAID';
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollTemplate {
  id: string;
  name: string;
  description: string;
  items: PayrollTemplateItem[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollTemplateItem {
  id: string;
  templateId: string;
  name: string;
  type: 'ALLOWANCE' | 'DEDUCTION';
  value: number;
  valueType: 'FIXED' | 'PERCENTAGE';
  createdAt: Date;
  updatedAt: Date;
}
