
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Clock, DollarSign, FilePlus, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'loan_applied' | 'loan_approved' | 'loan_disbursed' | 'client_registered' | 'repayment_received';
  description: string;
  timestamp: Date;
  user: string;
  amount?: number;
}

interface RecentActivitiesProps {
  activities: ActivityItem[];
}

const iconMap = {
  loan_applied: FilePlus,
  loan_approved: Check,
  loan_disbursed: DollarSign,
  client_registered: UserPlus,
  repayment_received: DollarSign,
};

const colorMap = {
  loan_applied: 'bg-blue-100 text-blue-600',
  loan_approved: 'bg-green-100 text-green-600',
  loan_disbursed: 'bg-finance-100 text-finance-600',
  client_registered: 'bg-purple-100 text-purple-600',
  repayment_received: 'bg-amber-100 text-amber-600',
};

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = iconMap[activity.type];
            const colorClass = colorMap[activity.type];
            
            return (
              <div key={activity.id} className="flex items-start">
                <div className={cn('p-2 rounded-full mr-3', colorClass)}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground ml-2">by {activity.user}</p>
                  </div>
                  {activity.amount && (
                    <p className="text-sm font-medium mt-1 text-finance-600">
                      ${activity.amount.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
