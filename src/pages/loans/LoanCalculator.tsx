
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calculator } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(10000);
  const [interestRate, setInterestRate] = useState(12);
  const [loanTerm, setLoanTerm] = useState(12);
  const [calculationType, setCalculationType] = useState('reducing');
  const [scheduleData, setScheduleData] = useState<any[]>([]);

  const calculateLoan = () => {
    let schedule: any[] = [];

    if (calculationType === 'reducing') {
      // Calculate reducing balance loan
      const monthlyRate = interestRate / 100 / 12;
      const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
        (Math.pow(1 + monthlyRate, loanTerm) - 1);

      let balance = loanAmount;
      
      for (let i = 1; i <= loanTerm; i++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;
        
        schedule.push({
          period: i,
          payment: monthlyPayment.toFixed(2),
          principal: principalPayment.toFixed(2),
          interest: interestPayment.toFixed(2),
          balance: Math.max(0, balance).toFixed(2)
        });
      }
    } else {
      // Calculate flat rate loan
      const totalInterest = (loanAmount * interestRate / 100) * (loanTerm / 12);
      const monthlyPayment = (loanAmount + totalInterest) / loanTerm;
      const monthlyPrincipal = loanAmount / loanTerm;
      const monthlyInterest = totalInterest / loanTerm;
      
      let balance = loanAmount;
      
      for (let i = 1; i <= loanTerm; i++) {
        balance -= monthlyPrincipal;
        
        schedule.push({
          period: i,
          payment: monthlyPayment.toFixed(2),
          principal: monthlyPrincipal.toFixed(2),
          interest: monthlyInterest.toFixed(2),
          balance: Math.max(0, balance).toFixed(2)
        });
      }
    }
    
    setScheduleData(schedule);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Loan Calculator</h1>
            <p className="text-muted-foreground">Calculate loan repayments and view amortization schedules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Loan Parameters
              </CardTitle>
              <CardDescription>
                Enter the loan details to calculate repayments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (% per year)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="loanTerm">Loan Term (months)</Label>
                  <Input
                    id="loanTerm"
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Calculation Type</Label>
                  <Tabs 
                    value={calculationType} 
                    onValueChange={setCalculationType}
                    className="w-full"
                  >
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="reducing">Reducing Balance</TabsTrigger>
                      <TabsTrigger value="flat">Flat Rate</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <Button className="w-full" onClick={calculateLoan}>
                  Calculate
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Amortization Schedule</CardTitle>
              <CardDescription>
                Detailed breakdown of loan repayments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduleData.length > 0 ? (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduleData.map((row) => (
                        <TableRow key={row.period}>
                          <TableCell>{row.period}</TableCell>
                          <TableCell>${parseFloat(row.payment).toLocaleString()}</TableCell>
                          <TableCell>${parseFloat(row.principal).toLocaleString()}</TableCell>
                          <TableCell>${parseFloat(row.interest).toLocaleString()}</TableCell>
                          <TableCell>${parseFloat(row.balance).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Enter loan details and click Calculate to see the amortization schedule
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default LoanCalculator;
