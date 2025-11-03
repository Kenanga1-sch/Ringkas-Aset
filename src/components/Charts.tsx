import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { AssetStatus, FixedAsset, ConsumableAsset, Location } from '../types';

const PIE_COLORS = {
  [AssetStatus.Baik]: '#22c55e', // green-500
  [AssetStatus.RusakRingan]: '#f59e0b', // amber-500
  [AssetStatus.RusakBerat]: '#ef4444', // red-500
};

// --- UTILITY FUNCTIONS ---
const formatCurrencySimple = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);


interface AssetStatusPieChartProps {
  data: FixedAsset[];
}

export const AssetStatusPieChart: React.FC<AssetStatusPieChartProps> = ({ data }) => {
  const chartData = Object.values(AssetStatus).map(status => ({
    name: status,
    value: data.filter(asset => asset.status === status).length
  })).filter(item => item.value > 0);

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-500">Tidak ada data untuk ditampilkan.</div>;
  }

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

     if (sortedData.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500">Tidak ada data untuk ditampilkan.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Stok" fill="#3b82f6" />
            </BarChart>
        </ResponsiveContainer>
    );
};


interface AssetValueByLocationChartProps {
    fixedAssets: FixedAsset[];
    locations: Location[];
}

export const AssetValueByLocationChart: React.FC<AssetValueByLocationChartProps> = ({ fixedAssets, locations }) => {
    const locationMap = useMemo(() => new Map(locations.map(loc => [loc.id, loc.name])), [locations]);
    
    const chartData = useMemo(() => {
        const valueByLocation: { [key: string]: number } = {};
        
        fixedAssets.forEach(asset => {
            const locationName = locationMap.get(asset.locationId) || 'Tidak Diketahui';
            if (!valueByLocation[locationName]) {
                valueByLocation[locationName] = 0;
            }
            valueByLocation[locationName] += asset.price;
        });

        return Object.keys(valueByLocation).map(name => ({
            name,
            "Nilai Aset": valueByLocation[name],
        }));

    }, [fixedAssets, locationMap]);

    if (chartData.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500">Tidak ada data untuk ditampilkan.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value as number)} />
                <Tooltip formatter={(value) => formatCurrencySimple(value as number)} />
                <Legend />
                <Bar dataKey="Nilai Aset" fill="#8884d8" />
            </BarChart>
        </ResponsiveContainer>
    );
};

interface AssetAcquisitionChartProps {
    data: FixedAsset[];
}

export const AssetAcquisitionChart: React.FC<AssetAcquisitionChartProps> = ({ data }) => {
    const chartData = useMemo(() => {
        const valueByMonth: { [key: string]: number } = {};
        
        data.forEach(asset => {
            const month = asset.purchaseDate.substring(0, 7); // YYYY-MM
            if (!valueByMonth[month]) {
                valueByMonth[month] = 0;
            }
            valueByMonth[month] += asset.price;
        });

        return Object.keys(valueByMonth)
            .map(month => ({
                month,
                "Nilai Akuisisi": valueByMonth[month],
            }))
            .sort((a, b) => a.month.localeCompare(b.month));

    }, [data]);

    if (chartData.length === 0) {
        return <div className="flex items-center justify-center h-full text-slate-500">Tidak ada data akuisisi pada periode ini.</div>;
    }

    return (
         <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value as number)} />
                <Tooltip formatter={(value) => formatCurrencySimple(value as number)} />
                <Legend />
                <Line type="monotone" dataKey="Nilai Akuisisi" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    );
};
