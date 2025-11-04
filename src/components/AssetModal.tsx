import React, { useState, useEffect } from 'react';
import { FixedAsset, ConsumableAsset, Location, AssetType, AssetStatus, Asset } from '../types';

type AssetModalProps = {
  mode: 'add' | 'edit' | 'take' | 'reportDamage';
  asset: Asset | null;
  locations: Location[];
  fixedAssets: FixedAsset[];
  consumableAssets: ConsumableAsset[];
  onSave: (data: any) => void;
  onClose: () => void;
};

const AssetModal: React.FC<AssetModalProps> = ({
  mode,
  asset,
  locations,
  fixedAssets,
  consumableAssets,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: AssetType.Tetap,
    locationId: locations[0]?.id || '',
    purchaseDate: '',
    price: '',
    status: AssetStatus.Baik,
    unit: 'buah',
    quantity: '',
    quantityChange: '',
    notes: '',
  });

  useEffect(() => {
    if (mode === 'edit' && asset) {
      if ('price' in asset) {
        setFormData({
          ...formData,
          name: asset.name,
          code: asset.code,
          type: asset.type,
          locationId: asset.locationId,
          purchaseDate: asset.purchaseDate,
          price: asset.price.toString(),
          status: asset.status,
        });
      } else {
        setFormData({
          ...formData,
          name: asset.name,
          code: asset.code,
          type: asset.type,
          locationId: asset.locationId,
          unit: asset.unit,
          quantity: asset.quantity.toString(),
        });
      }
    } else if (mode === 'take' && asset && !('price' in asset)) {
      setFormData({
        ...formData,
        name: asset.name,
        quantity: asset.quantity.toString(),
      });
    } else if (mode === 'reportDamage' && asset && 'price' in asset) {
      setFormData({
        ...formData,
        name: asset.name,
        status: asset.status,
      });
    }
  }, [mode, asset]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const INPUT_CLASSES = "mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-blue-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {mode === 'add' && 'Tambah Aset Baru'}
            {mode === 'edit' && 'Edit Aset'}
            {mode === 'take' && 'Ambil Stok'}
            {mode === 'reportDamage' && 'Lapor Aset Rusak'}
          </h2>
          <button onClick={onClose} className="text-2xl leading-none hover:text-slate-200">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {(mode === 'add' || mode === 'edit') && (
            <>
              {mode === 'add' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Tipe Aset</label>
                  <select name="type" value={formData.type} onChange={handleChange} className={INPUT_CLASSES}>
                    <option value={AssetType.Tetap}>Aset Tetap</option>
                    <option value={AssetType.HabisPakai}>Barang Habis Pakai</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700">Nama</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={INPUT_CLASSES} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Kode</label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} className={INPUT_CLASSES} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Lokasi</label>
                <select name="locationId" value={formData.locationId} onChange={handleChange} className={INPUT_CLASSES} required>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              {formData.type === AssetType.Tetap ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Tanggal Pembelian</label>
                    <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className={INPUT_CLASSES} required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Harga (Rp)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className={INPUT_CLASSES} required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className={INPUT_CLASSES}>
                      <option value={AssetStatus.Baik}>Baik</option>
                      <option value={AssetStatus.RusakRingan}>Rusak Ringan</option>
                      <option value={AssetStatus.RusakBerat}>Rusak Berat</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Satuan</label>
                    <input type="text" name="unit" value={formData.unit} onChange={handleChange} className={INPUT_CLASSES} required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Jumlah Stok</label>
                    <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className={INPUT_CLASSES} required />
                  </div>
                </>
              )}
            </>
          )}

          {mode === 'take' && (
            <>
              <div className="p-3 bg-slate-100 rounded-md">
                <p className="text-sm font-medium text-slate-700">Barang: {formData.name}</p>
                <p className="text-sm text-slate-600">Stok Tersedia: {formData.quantity}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Jumlah Ambil</label>
                <input type="number" name="quantityChange" value={formData.quantityChange} onChange={handleChange} className={INPUT_CLASSES} required min="1" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Catatan (Opsional)</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} className={INPUT_CLASSES} rows={3} />
              </div>
            </>
          )}

          {mode === 'reportDamage' && (
            <>
              <div className="p-3 bg-slate-100 rounded-md">
                <p className="text-sm font-medium text-slate-700">Aset: {formData.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Status Kerusakan</label>
                <select name="status" value={formData.status} onChange={handleChange} className={INPUT_CLASSES}>
                  <option value={AssetStatus.Baik}>Baik</option>
                  <option value={AssetStatus.RusakRingan}>Rusak Ringan</option>
                  <option value={AssetStatus.RusakBerat}>Rusak Berat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Catatan Kerusakan</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} className={INPUT_CLASSES} rows={3} required />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium">
              Simpan
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-slate-200 text-slate-800 py-2 rounded-md hover:bg-slate-300 font-medium">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetModal;
