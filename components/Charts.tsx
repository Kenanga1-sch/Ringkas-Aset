import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AssetStatus, FixedAsset, ConsumableAsset } from '../types';

const PIE_COLORS = {
  [AssetStatus.Baik]: '#22c55e', // green-500
  [AssetStatus.RusakRingan]: '#f59e0b', // amber-500
  [AssetStatus.RusakBerat]: '#ef4444', // red-500
};

interface AssetStatusPieChartProps {
  data: FixedAsset[];
}

export const AssetStatusPieChart: React.FC<AssetStatusPieChartProps> = ({ data }) => {
  const chartData = Object.values(AssetStatus).map(status => ({
    name: status,
    value: data.filter(asset => asset.status === status).length
  })).filter(item => item.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
            return (
              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as AssetStatus]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

interface TopConsumablesBarChartProps {
    data: ConsumableAsset[];
}

export const TopConsumablesBarChart: React.FC<TopConsumablesBarChartProps> = ({ data }) => {
    const sortedData = [...data]
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 5)
        .map(item => ({ name: item.name, Stok: item.quantity }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Stok" fill="#3b82f6" />
            </BarChart>
        </ResponsiveContainer>
    );
};