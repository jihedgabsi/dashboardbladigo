import React, { ReactNode } from 'react';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend: 'up' | 'down';
  trendValue: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendValue }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="p-2 bg-red-100 rounded-md text-red-700">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <div className={`flex items-center text-sm ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" />
          )}
          <span>{trendValue}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;