
export interface Loan {
  id: string;
  clientId: string;
  amount: number;
  interestRate: number;
  term: number; // in months
  purpose: string;
  status: LoanStatus;
  approvedBy?: string;
  approvedAt?: Date;
  disbursedAt?: Date;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  branchId: string;
}

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DISBURSED = 'DISBURSED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DEFAULTED = 'DEFAULTED',
  REJECTED = 'REJECTED',
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  isPaid: boolean;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}
