
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address: string;
  nationalId: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  occupation: string;
  incomeSource: string;
  monthlyIncome: number;
  branchId: string;
  createdAt: Date;
  updatedAt: Date;
  status: ClientStatus;
  photo?: string;
}

export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLACKLISTED = 'BLACKLISTED',
  PENDING = 'PENDING',
}
