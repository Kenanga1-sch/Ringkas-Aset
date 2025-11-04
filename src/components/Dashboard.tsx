import React, { useMemo } from 'react';
import { FixedAsset, ConsumableAsset, Location, AssetStatus, User } from '../types';
import { PlusIcon, MinusIcon, WrenchIcon, ReportIcon } from './Icons';
import { AssetStatusPieChart, TopConsumablesBarChart } from './Charts';

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const Card: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className, id }) => (
  <div id={id} className={`bg-white rounded-xl shadow-md p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

type DashboardProps = {
  fixedAssets: FixedAsset[];
  consumableAssets: ConsumableAsset[];
  locations: Location[];
  currentUser: User;
  onActionClick: (action: 'add' | 'take' | 'reportDamage' | 'reports') => void;
};

const Dashboard: React.FC<DashboardProps> = ({ fixedAssets, consumableAssets, onActionClick }) => {
  const totalAssetValue = useMemo(() => fixedAssets.reduce((sum, asset) => sum + asset.price, 0), [fixedAssets]);
  const damagedItems = useMemo(() => fixedAssets.filter(item => item.status !== AssetStatus.Baik).length, [fixedAssets]);

  const allActions: {
    label: string;
    icon: React.ReactNode;
    action: 'add' | 'take' | 'reportDamage' | 'reports';
  }[] = [
    { label: "Tambah Barang", icon: <PlusIcon className="w-8 h-8 text-blue-500" />, action: 'add' },
    { label: "Ambil Stok", icon: <MinusIcon className="w-8 h-8 text-green-500" />, action: 'take' },
    { label: "Lapor Rusak", icon: <WrenchIcon className="w-8 h-8 text-amber-500" />, action: 'reportDamage' },
    { label: "Lihat Laporan", icon: <ReportIcon className="w-8 h-8 text-blue-600" />, action: 'reports' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {allActions.map(action => (
          <button key={action.label} onClick={() => onActionClick(action.action)} className="bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all text-center space-y-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center bg-slate-100">{action.icon}</div>
            <p className="font-semibold text-slate-700 text-sm sm:text-base">{action.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-medium text-slate-500">Total Nilai Aset</h3>
          <p className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900">{formatCurrency(totalAssetValue)}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-slate-500">Aset Perlu Perhatian</h3>
          <p className="mt-1 text-2xl sm:text-3xl font-semibold text-amber-600">{damagedItems}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Status Aset Tetap</h3>
          <AssetStatusPieChart data={fixedAssets} />
        </Card>
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">5 Barang dengan Stok Terendah</h3>
          <TopConsumablesBarChart data={consumableAssets} />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
