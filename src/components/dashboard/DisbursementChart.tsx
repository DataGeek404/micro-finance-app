
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChartData {
  date: string;
  disbursement: number;
  profit: number;
}

interface DisbursementChartProps {
  data: ChartData[];
}

const DisbursementChart: React.FC<DisbursementChartProps> = ({ data }) => {
  return (
    <Card className="col-span-2 h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">
          Disbursement & Profit Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorDisbursement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#28a0b7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#28a0b7" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0C8599" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0C8599" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.getDate().toString();
              }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <Area 
              type="monotone" 
              dataKey="disbursement" 
              stroke="#28a0b7" 
              fillOpacity={1}
              fill="url(#colorDisbursement)" 
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="#0C8599" 
              fillOpacity={1}
              fill="url(#colorProfit)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DisbursementChart;
