
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
  productId?: string;
  charges?: LoanCharge[];
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

export interface LoanProduct {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  interestRate: number;
  interestType: 'FLAT' | 'REDUCING_BALANCE';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanCharge {
  id: string;
  name: string;
  amount: number;
  type: 'FIXED' | 'PERCENTAGE';
  chargeWhen: 'DISBURSEMENT' | 'REPAYMENT' | 'OVERDUE';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoanApplication {
  id: string;
  clientId: string;
  productId: string;
  amount: number;
  term: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}
