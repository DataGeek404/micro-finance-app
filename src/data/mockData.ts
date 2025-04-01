
import { Client, ClientStatus } from '@/types/client';
import { Loan, LoanStatus, LoanRepayment } from '@/types/loan';
import { Branch, BranchStatus } from '@/types/branch';
import { User, UserRole } from '@/types/auth';

// Mock Clients
export const mockClients: Client[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@example.com',
    phone: '555-123-4567',
    address: '123 Main St, Anytown',
    nationalId: 'ID12345678',
    dateOfBirth: new Date('1985-05-15'),
    gender: 'male',
    occupation: 'Small Business Owner',
    incomeSource: 'Retail Shop',
    monthlyIncome: 1500,
    branchId: '1',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
    status: ClientStatus.ACTIVE,
    photo: '/placeholder.svg',
  },
  {
    id: '2',
    firstName: 'Mary',
    lastName: 'Johnson',
    email: 'mary@example.com',
    phone: '555-987-6543',
    address: '456 Oak Ave, Somewhere',
    nationalId: 'ID87654321',
    dateOfBirth: new Date('1990-09-23'),
    gender: 'female',
    occupation: 'Farmer',
    incomeSource: 'Agriculture',
    monthlyIncome: 1200,
    branchId: '2',
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2023-02-10'),
    status: ClientStatus.ACTIVE,
    photo: '/placeholder.svg',
  },
  {
    id: '3',
    firstName: 'Robert',
    lastName: 'Chen',
    email: 'robert@example.com',
    phone: '555-222-3333',
    address: '789 Pine Rd, Elsewhere',
    nationalId: 'ID11223344',
    dateOfBirth: new Date('1978-12-03'),
    gender: 'male',
    occupation: 'Craftsman',
    incomeSource: 'Carpentry',
    monthlyIncome: 1800,
    branchId: '1',
    createdAt: new Date('2023-03-05'),
    updatedAt: new Date('2023-03-05'),
    status: ClientStatus.INACTIVE,
    photo: '/placeholder.svg',
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Patel',
    phone: '555-444-5555',
    address: '101 Maple St, Nowhere',
    nationalId: 'ID55667788',
    dateOfBirth: new Date('1992-07-19'),
    gender: 'female',
    occupation: 'Market Vendor',
    incomeSource: 'Food Sales',
    monthlyIncome: 1350,
    branchId: '2',
    createdAt: new Date('2023-01-25'),
    updatedAt: new Date('2023-01-25'),
    status: ClientStatus.PENDING,
    photo: '/placeholder.svg',
  },
];

// Mock Loans
export const mockLoans: Loan[] = [
  {
    id: '1',
    clientId: '1',
    amount: 5000,
    interestRate: 12.5,
    term: 12,
    purpose: 'Business Expansion',
    status: LoanStatus.ACTIVE,
    approvedBy: '1',
    approvedAt: new Date('2023-01-20'),
    disbursedAt: new Date('2023-01-25'),
    startDate: new Date('2023-02-01'),
    endDate: new Date('2024-01-31'),
    createdAt: new Date('2023-01-16'),
    updatedAt: new Date('2023-01-25'),
    branchId: '1',
  },
  {
    id: '2',
    clientId: '2',
    amount: 3000,
    interestRate: 10.0,
    term: 6,
    purpose: 'Purchase farming equipment',
    status: LoanStatus.DISBURSED,
    approvedBy: '1',
    approvedAt: new Date('2023-02-12'),
    disbursedAt: new Date('2023-02-15'),
    startDate: new Date('2023-03-01'),
    endDate: new Date('2023-08-31'),
    createdAt: new Date('2023-02-11'),
    updatedAt: new Date('2023-02-15'),
    branchId: '2',
  },
  {
    id: '3',
    clientId: '3',
    amount: 2500,
    interestRate: 15.0,
    term: 18,
    purpose: 'Purchase tools and materials',
    status: LoanStatus.PENDING,
    createdAt: new Date('2023-03-07'),
    updatedAt: new Date('2023-03-07'),
    branchId: '1',
  },
  {
    id: '4',
    clientId: '4',
    amount: 1500,
    interestRate: 12.0,
    term: 24,
    purpose: 'Inventory purchase',
    status: LoanStatus.APPROVED,
    approvedBy: '1',
    approvedAt: new Date('2023-01-28'),
    createdAt: new Date('2023-01-26'),
    updatedAt: new Date('2023-01-28'),
    branchId: '2',
  },
];

// Mock Loan Repayments
export const mockRepayments: LoanRepayment[] = [
  {
    id: '1',
    loanId: '1',
    amount: 468.75,
    dueDate: new Date('2023-03-01'),
    paidDate: new Date('2023-02-28'),
    isPaid: true,
    paymentMethod: 'Cash',
    transactionId: 'TXN001',
    createdAt: new Date('2023-01-25'),
    updatedAt: new Date('2023-02-28'),
  },
  {
    id: '2',
    loanId: '1',
    amount: 468.75,
    dueDate: new Date('2023-04-01'),
    paidDate: new Date('2023-03-30'),
    isPaid: true,
    paymentMethod: 'Mobile Money',
    transactionId: 'TXN002',
    createdAt: new Date('2023-01-25'),
    updatedAt: new Date('2023-03-30'),
  },
  {
    id: '3',
    loanId: '1',
    amount: 468.75,
    dueDate: new Date('2023-05-01'),
    paidDate: new Date('2023-05-02'),
    isPaid: true,
    paymentMethod: 'Bank Transfer',
    transactionId: 'TXN003',
    createdAt: new Date('2023-01-25'),
    updatedAt: new Date('2023-05-02'),
  },
  {
    id: '4',
    loanId: '1',
    amount: 468.75,
    dueDate: new Date('2023-06-01'),
    isPaid: false,
    createdAt: new Date('2023-01-25'),
    updatedAt: new Date('2023-01-25'),
  },
];

// Mock Branches
export const mockBranches: Branch[] = [
  {
    id: '1',
    name: 'Headquarters',
    location: 'Central City',
    address: '100 Main Boulevard, Central City',
    phone: '555-100-2000',
    email: 'hq@microfinance.com',
    managerName: 'Admin User',
    managerId: '1',
    status: BranchStatus.ACTIVE,
    openingDate: new Date('2020-01-10'),
    employeeCount: 15,
    createdAt: new Date('2020-01-10'),
    updatedAt: new Date('2022-05-15'),
  },
  {
    id: '2',
    name: 'North Branch',
    location: 'Northern District',
    address: '45 North Road, Northern District',
    phone: '555-200-3000',
    email: 'north@microfinance.com',
    managerName: 'Jane Wilson',
    managerId: '2',
    status: BranchStatus.ACTIVE,
    openingDate: new Date('2021-03-15'),
    employeeCount: 8,
    createdAt: new Date('2021-03-15'),
    updatedAt: new Date('2022-06-20'),
  },
  {
    id: '3',
    name: 'East Branch',
    location: 'Eastern Region',
    address: '22 East Street, Eastern Region',
    phone: '555-300-4000',
    email: 'east@microfinance.com',
    managerName: 'Michael Brown',
    managerId: '3',
    status: BranchStatus.ACTIVE,
    openingDate: new Date('2021-07-05'),
    employeeCount: 6,
    createdAt: new Date('2021-07-05'),
    updatedAt: new Date('2022-10-10'),
  },
  {
    id: '4',
    name: 'South Branch',
    location: 'Southern City',
    address: '88 South Avenue, Southern City',
    phone: '555-400-5000',
    email: 'south@microfinance.com',
    managerName: 'Emily Rodriguez',
    managerId: '4',
    status: BranchStatus.PENDING,
    openingDate: new Date('2023-01-20'),
    employeeCount: 5,
    createdAt: new Date('2022-11-15'),
    updatedAt: new Date('2023-01-10'),
  },
];

// Generate Dashboard Stats
export const getDashboardStats = () => {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  
  // Total active loans
  const activeLoans = mockLoans.filter(loan => 
    loan.status === LoanStatus.ACTIVE || loan.status === LoanStatus.DISBURSED
  );
  
  // Total pending loans
  const pendingLoans = mockLoans.filter(loan => loan.status === LoanStatus.PENDING);
  
  // Total active clients
  const activeClients = mockClients.filter(client => client.status === ClientStatus.ACTIVE);
  
  // Total loan amount disbursed
  const totalDisbursed = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
  
  // Total expected repayments this month
  const totalExpectedThisMonth = 5625; // Simplified for mock data
  
  // Total received repayments this month
  const totalReceivedThisMonth = 4218.75; // Simplified for mock data
  
  // Get daily profit/disbursement data for the chart (last 30 days)
  const lastThirtyDays = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });
  
  const dailyData = lastThirtyDays.map(date => {
    const randomDisbursement = Math.floor(Math.random() * 2000) + 500;
    const randomProfit = Math.floor(randomDisbursement * (Math.random() * 0.1 + 0.05));
    return {
      date,
      disbursement: randomDisbursement,
      profit: randomProfit
    };
  });

  return {
    activeLoans: activeLoans.length,
    pendingLoans: pendingLoans.length,
    activeClients: activeClients.length,
    totalBranches: mockBranches.length,
    totalAmountDisbursed: totalDisbursed,
    totalExpectedThisMonth,
    totalReceivedThisMonth,
    repaymentRate: (totalReceivedThisMonth / totalExpectedThisMonth) * 100,
    dailyData
  };
};

// Dashboard loan status distribution for pie chart
export const getLoanStatusDistribution = () => {
  const statusCounts = {
    [LoanStatus.PENDING]: 0,
    [LoanStatus.APPROVED]: 0,
    [LoanStatus.DISBURSED]: 0,
    [LoanStatus.ACTIVE]: 0,
    [LoanStatus.COMPLETED]: 0,
    [LoanStatus.DEFAULTED]: 0,
    [LoanStatus.REJECTED]: 0,
  };
  
  mockLoans.forEach(loan => {
    statusCounts[loan.status]++;
  });
  
  return Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count
  }));
};
