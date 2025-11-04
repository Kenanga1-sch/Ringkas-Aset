import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { FixedAsset, ConsumableAsset, Location, AssetStatus } from '../types';
import { AssetValueByLocationChart, AssetAcquisitionChart } from './Charts';

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const Card: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className, id }) => (
  <div id={id} className={`bg-white rounded-xl shadow-md p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

type ReportsPageProps = {
  fixedAssets: FixedAsset[];
  consumableAssets: ConsumableAsset[];
  locations: Location[];
};

const ReportsPage: React.FC<ReportsPageProps> = ({ fixedAssets, consumableAssets, locations }) => {
  const locationMap = useMemo(() => new Map(locations.map(loc => [loc.id, loc.name])), [locations]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);

  const filteredFixedAssets = useMemo(() => {
    return fixedAssets.filter(asset => {
      if (startDate && asset.purchaseDate < startDate) return false;
      if (endDate && asset.purchaseDate > endDate) return false;
      return true;
    });
  }, [fixedAssets, startDate, endDate]);

  const summary = useMemo(() => {
    const totalValue = filteredFixedAssets.reduce((sum, asset) => sum + asset.price, 0);
    const damagedCount = filteredFixedAssets.filter(a => a.status !== AssetStatus.Baik).length;
    return { totalValue, damagedCount, newAssetsCount: filteredFixedAssets.length };
  }, [filteredFixedAssets]);

  const handleGeneratePdf = async () => {
    setIsPrinting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const margin = 15;
      let cursorY = margin;

      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Ringkas Aset', margin, cursorY);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Laporan Inventaris Aset', margin, cursorY + 8);

      const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Dicetak pada: ${today}`, doc.internal.pageSize.getWidth() - margin, cursorY, { align: 'right' });
      cursorY += 20;

      if (filteredFixedAssets.length > 0) {
        (doc as any).autoTable({
          startY: cursorY,
          head: [['Nama', 'Kode', 'Lokasi', 'Tgl. Beli', 'Status', 'Harga']],
          body: filteredFixedAssets.map(asset => [
            asset.name,
            asset.code,
            locationMap.get(asset.locationId) || 'N/A',
            asset.purchaseDate,
            asset.status,
            formatCurrency(asset.price),
          ]),
          theme: 'grid',
          headStyles: { fillColor: [22, 163, 74] },
        });
      }

      doc.save(`laporan-aset-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Laporan Inventaris</h2>
            <p className="text-sm text-slate-500 mt-1">Ringkasan dan analisis data aset sekolah.</p>
          </div>
          <button
            onClick={handleGeneratePdf}
            disabled={isPrinting}
            className="no-print flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-wait"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            <span>{isPrinting ? 'Mencetak...' : 'Cetak Laporan PDF'}</span>
          </button>
        </div>
      </Card>

      <Card className="no-print">
        <h3 className="font-semibold text-slate-800 mb-2">Filter Laporan</h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700">Dari Tanggal</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700">Sampai Tanggal</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => { setStartDate(''); setEndDate(''); }} className="px-4 py-2 text-sm font-medium bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Reset</button>
        </div>
      </Card>

      <div id="report-summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <h3 className="text-sm font-medium text-slate-500">Total Aset Tetap</h3>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{fixedAssets.length}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-slate-500">Nilai Total (Periode)</h3>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{formatCurrency(summary.totalValue)}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-slate-500">Aset Baru (Periode)</h3>
          <p className="mt-1 text-3xl font-semibold text-blue-600">{summary.newAssetsCount}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-medium text-slate-500">Aset Rusak (Periode)</h3>
          <p className="mt-1 text-3xl font-semibold text-amber-600">{summary.damagedCount}</p>
        </Card>
      </div>

      <div id="report-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Nilai Aset per Lokasi</h3>
          <AssetValueByLocationChart fixedAssets={filteredFixedAssets} locations={locations} />
        </Card>
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Tren Akuisisi Aset</h3>
          <AssetAcquisitionChart data={filteredFixedAssets} />
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Rincian Aset Tetap</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-4 py-2">Nama</th>
                <th className="px-4 py-2">Kode</th>
                <th className="px-4 py-2">Lokasi</th>
                <th className="px-4 py-2">Tgl. Beli</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Harga</th>
              </tr>
            </thead>
            <tbody>
              {filteredFixedAssets.length > 0 ? filteredFixedAssets.map(asset => (
                <tr key={asset.id} className="bg-white border-b">
                  <td className="px-4 py-2 font-medium">{asset.name}</td>
                  <td className="px-4 py-2">{asset.code}</td>
                  <td className="px-4 py-2">{locationMap.get(asset.locationId)}</td>
                  <td className="px-4 py-2">{asset.purchaseDate}</td>
                  <td className="px-4 py-2">{asset.status}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(asset.price)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">Tidak ada data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;
