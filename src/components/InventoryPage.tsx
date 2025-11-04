import React, { useState, useMemo } from 'react';
import { FixedAsset, ConsumableAsset, Location, AssetStatus, AssetType, Role, User, Asset } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, Cog6ToothIcon } from './Icons';

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white rounded-xl shadow-md p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

const usePagination = <T,>(data: T[], initialItemsPerPage: number = 5) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [data.length, totalPages, currentPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  return {
    currentPage,
    totalPages,
    paginatedData,
    nextPage: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)),
    prevPage: () => setCurrentPage(prev => Math.max(prev - 1, 1)),
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
    itemsPerPage,
    setItemsPerPage: (newSize: number) => {
      setItemsPerPage(newSize);
      setCurrentPage(1);
    },
  };
};

type InventoryPageProps = {
  fixedAssets: FixedAsset[];
  consumableAssets: ConsumableAsset[];
  locations: Location[];
  currentUser: User;
  onAddAsset: () => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
  onManageLocations: () => void;
};

const InventoryPage: React.FC<InventoryPageProps> = ({
  fixedAssets,
  consumableAssets,
  locations,
  currentUser,
  onAddAsset,
  onEditAsset,
  onDeleteAsset,
}) => {
  const [activeTab, setActiveTab] = useState<AssetType>(AssetType.Tetap);
  const locationMap = useMemo(() => new Map(locations.map(loc => [loc.id, loc.name])), [locations]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');

  const filteredFixedAssets = useMemo(() => {
    return fixedAssets.filter(asset =>
      (selectedLocationId === 'all' || asset.locationId === selectedLocationId) &&
      (asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [fixedAssets, searchTerm, selectedLocationId]);

  const filteredConsumableAssets = useMemo(() => {
    return consumableAssets.filter(asset =>
      (selectedLocationId === 'all' || asset.locationId === selectedLocationId) &&
      (asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [consumableAssets, searchTerm, selectedLocationId]);

  const fixedPagination = usePagination(filteredFixedAssets);
  const consumablePagination = usePagination(filteredConsumableAssets);

  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Daftar Inventaris</h2>
          <p className="text-sm text-slate-500">Kelola semua aset tetap dan barang habis pakai.</p>
        </div>
        <button onClick={onAddAsset} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition-colors">
          <PlusIcon className="w-5 h-5" />
          <span>Tambah Barang</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau kode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedLocationId}
          onChange={(e) => setSelectedLocationId(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">Semua Lokasi</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
      </div>

      <div className="border-b border-slate-200 mb-4">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab(AssetType.Tetap)}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === AssetType.Tetap
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Aset Tetap ({filteredFixedAssets.length})
          </button>
          <button
            onClick={() => setActiveTab(AssetType.HabisPakai)}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === AssetType.HabisPakai
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Barang Habis Pakai ({filteredConsumableAssets.length})
          </button>
        </nav>
      </div>

      {activeTab === AssetType.Tetap && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-6 py-3">Foto</th>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Kode</th>
                <th className="px-6 py-3">Lokasi</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Harga</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {fixedPagination.paginatedData.map(asset => (
                <tr key={asset.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <img src={asset.photoUrl || 'https://via.placeholder.com/50'} alt={asset.name} className="w-12 h-12 object-cover rounded-md" />
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{asset.name}</td>
                  <td className="px-6 py-4">{asset.code}</td>
                  <td className="px-6 py-4">{locationMap.get(asset.locationId) || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      asset.status === AssetStatus.Baik ? 'bg-green-100 text-green-800' :
                      asset.status === AssetStatus.RusakRingan ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>{asset.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">{formatCurrency(asset.price)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => onEditAsset(asset)} className="p-2 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors" title="Ubah">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => onDeleteAsset(asset.id)} className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Hapus">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4 px-2 py-2 border-t">
            <span className="text-sm text-slate-600">Halaman {fixedPagination.currentPage} dari {fixedPagination.totalPages || 1}</span>
            <div className="flex gap-2">
              <button onClick={fixedPagination.prevPage} disabled={!fixedPagination.canGoPrev} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:bg-slate-300">Sebelumnya</button>
              <button onClick={fixedPagination.nextPage} disabled={!fixedPagination.canGoNext} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:bg-slate-300">Berikutnya</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === AssetType.HabisPakai && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Kode</th>
                <th className="px-6 py-3">Lokasi</th>
                <th className="px-6 py-3 text-center">Stok</th>
                <th className="px-6 py-3">Satuan</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {consumablePagination.paginatedData.map(asset => (
                <tr key={asset.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{asset.name}</td>
                  <td className="px-6 py-4">{asset.code}</td>
                  <td className="px-6 py-4">{locationMap.get(asset.locationId) || 'N/A'}</td>
                  <td className="px-6 py-4 text-center">{asset.quantity}</td>
                  <td className="px-6 py-4">{asset.unit}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => onEditAsset(asset)} className="p-2 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors" title="Ubah">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => onDeleteAsset(asset.id)} className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Hapus">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4 px-2 py-2 border-t">
            <span className="text-sm text-slate-600">Halaman {consumablePagination.currentPage} dari {consumablePagination.totalPages || 1}</span>
            <div className="flex gap-2">
              <button onClick={consumablePagination.prevPage} disabled={!consumablePagination.canGoPrev} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:bg-slate-300">Sebelumnya</button>
              <button onClick={consumablePagination.nextPage} disabled={!consumablePagination.canGoNext} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md disabled:bg-slate-300">Berikutnya</button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default InventoryPage;
