
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface StatusData {
  name: string;
  value: number;
}

interface LoanStatusChartProps {
  data: StatusData[];
}

const COLORS = ['#28a0b7', '#0C8599', '#0B7285', '#1098AD', '#0CA678', '#20C997', '#12B886'];

const LoanStatusChart: React.FC<LoanStatusChartProps> = ({ data }) => {
  return (
    <Card className="h-[400px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Loan Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => 
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LoanStatusChart;
