
export interface Expense {
  id: string;
  amount: number;
  date: Date;
  description: string;
  typeId: string;
  paymentMethod: string;
  reference?: string;
  branchId: string;
  approvedBy?: string;
  approvedAt?: Date;
  status: ExpenseStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID'
}

export interface ExpenseType {
  id: string;
  name: string;
  description?: string;
  budget?: number;
  createdAt: Date;
  updatedAt: Date;
}
