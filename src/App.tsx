import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Asset,
  FixedAsset,
  ConsumableAsset,
  Location,
  AssetStatus,
  AssetType,
  Role,
  User,
} from './types';
import { AssetStatusPieChart, TopConsumablesBarChart } from './components/Charts';
import { 
    PlusIcon, WrenchIcon, ReportIcon, QrCodeIcon, HomeIcon, ArchiveBoxIcon, MinusIcon, UsersIcon, PencilIcon, TrashIcon, Cog6ToothIcon
} from './components/Icons';

// --- MOCK DATA & AUTHENTICATION ---
const INITIAL_LOCATIONS: Location[] = [
  { id: 'loc-1', name: 'Ruang Guru' },
  { id: 'loc-2', name: 'Perpustakaan' },
  { id: 'loc-3', name: 'Kelas 10A' },
  { id: 'loc-4', name: 'Gudang ATK' },
];

// Database Pengguna Tiruan
const USERS_DATA: User[] = [
    { id: 'user-1', name: 'Andi (Admin)', username: 'admin', password: 'password123', role: Role.Admin, responsibleLocationIds: [] }, // Admin has access to all
    { id: 'user-2', name: 'Budi (Guru)', username: 'guru', password: 'password123', role: Role.Guru, responsibleLocationIds: ['loc-3'] }, // Responsible for Kelas 10A
    { id: 'user-3', name: 'Citra (Penjaga Sekolah)', username: 'penjaga', password: 'password123', role: Role.PenjagaSekolah, responsibleLocationIds: ['loc-1', 'loc-4'] }, // Responsible for Ruang Guru and Gudang
];

// Layanan Otentikasi Tiruan (mensimulasikan backend FastAPI)
const authenticate = (username: string, password: string): Promise<{ token: string; user: User }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => { // Mensimulasikan latensi jaringan
            const user = USERS_DATA.find(u => u.username === username);
            if (user && user.password === password) {
                // Jangan sertakan password dalam data pengguna yang dikembalikan
                const { password, ...userWithoutPassword } = user;
                resolve({
                    token: `mock-jwt-token-for-${user.username}-${Date.now()}`,
                    user: userWithoutPassword,
                });
            } else {
                reject(new Error("Username atau password salah."));
            }
        }, 1000); // Penundaan 1 detik
    });
};


const INITIAL_FIXED_ASSETS: FixedAsset[] = [
  { id: 'fa-1', name: 'Laptop ASUS', code: 'LP-001', type: AssetType.Tetap, locationId: 'loc-1', purchaseDate: '2023-01-15', price: 12000000, status: AssetStatus.Baik, photoUrl: 'https://picsum.photos/seed/laptop1/200/200' },
  { id: 'fa-2', name: 'Proyektor InFocus', code: 'PR-001', type: AssetType.Tetap, locationId: 'loc-2', purchaseDate: '2022-08-20', price: 7500000, status: AssetStatus.RusakBerat, photoUrl: 'https://picsum.photos/seed/projector/200/200' },
  { id: 'fa-3', name: 'Meja Guru', code: 'MJ-010', type: AssetType.Tetap, locationId: 'loc-1', purchaseDate: '2020-03-10', price: 1500000, status: AssetStatus.Baik, photoUrl: 'https://picsum.photos/seed/desk/200/200' },
  { id: 'fa-4', name: 'Kursi Siswa', code: 'KS-105', type: AssetType.Tetap, locationId: 'loc-3', purchaseDate: '2020-03-10', price: 450000, status: AssetStatus.RusakRingan, photoUrl: 'https://picsum.photos/seed/chair1/200/200' },
  { id: 'fa-5', name: 'Laptop Lenovo', code: 'LP-002', type: AssetType.Tetap, locationId: 'loc-2', purchaseDate: '2023-05-11', price: 9500000, status: AssetStatus.Baik, photoUrl: 'https://picsum.photos/seed/laptop2/200/200' },
  { id: 'fa-6', name: 'Papan Tulis Digital', code: 'PT-001', type: AssetType.Tetap, locationId: 'loc-3', purchaseDate: '2023-09-01', price: 25000000, status: AssetStatus.Baik, photoUrl: 'https://picsum.photos/seed/whiteboard/200/200' },
  { id: 'fa-7', name: 'AC Ruangan', code: 'AC-003', type: AssetType.Tetap, locationId: 'loc-1', purchaseDate: '2021-06-20', price: 4500000, status: AssetStatus.Baik, photoUrl: 'https://picsum.photos/seed/ac/200/200' },
];

const INITIAL_CONSUMABLE_ASSETS: ConsumableAsset[] = [
  { id: 'ca-1', name: 'Kertas A4', code: 'ATK-001', type: AssetType.HabisPakai, quantity: 8, unit: 'rim', locationId: 'loc-4' },
  { id: 'ca-2', name: 'Spidol Boardmarker Hitam', code: 'ATK-002', type: AssetType.HabisPakai, quantity: 25, unit: 'buah', locationId: 'loc-1' },
  { id: 'ca-3', name: 'Tinta Printer Hitam', code: 'ATK-003', type: AssetType.HabisPakai, quantity: 5, unit: 'botol', locationId: 'loc-4' },
  { id: 'ca-4', name: 'Buku Tulis', code: 'ATK-004', type: AssetType.HabisPakai, quantity: 50, unit: 'pak', locationId: 'loc-4' },
  { id: 'ca-5', name: 'Penghapus Papan', code: 'ATK-005', type: AssetType.HabisPakai, quantity: 9, unit: 'buah', locationId: 'loc-3' },
  { id: 'ca-6', name: 'Isi Staples No.10', code: 'ATK-006', type: AssetType.HabisPakai, quantity: 15, unit: 'kotak', locationId: 'loc-1' },
  { id: 'ca-7', name: 'Klip Kertas', code: 'ATK-007', type: AssetType.HabisPakai, quantity: 30, unit: 'kotak', locationId: 'loc-4' },
];

// --- UTILITY FUNCTIONS ---
const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
const INPUT_CLASSES = "mt-1 block w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

// --- LOGIN PAGE COMPONENT ---
type LoginPageProps = {
    onLogin: (username: string, password: string) => Promise<void>;
};
const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await onLogin(username, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <div className="max-w-sm w-full">
                <div className="flex flex-col items-center space-y-2 mb-8">
                    <div className="bg-blue-600 p-3 rounded-lg">
                        <ArchiveBoxIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 text-center">Ringkas Aset</h1>
                        <p className="text-sm text-slate-500 text-center">Inventaris Cepat, Laporan Tepat.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={INPUT_CLASSES}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-slate-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={INPUT_CLASSES}
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : 'Login'}
                    </button>
                </form>
                 <div className="text-center mt-4">
                     <p className="text-xs text-slate-500">Hint: coba 'admin', 'guru', atau 'penjaga' dengan password 'password123'.</p>
                </div>
            </div>
             <footer className="absolute bottom-4 text-center py-4 text-xs text-slate-400">
                 &copy; {new Date().getFullYear()} Ringkas Aset.
            </footer>
        </div>
    );
};

// --- SUB-COMPONENTS ---
type View = 'dashboard' | 'inventory' | 'reports' | 'users';
const NAV_ITEMS: { view: View; label: string; icon: React.ReactElement<{ className?: string }>, roles: Role[] }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="w-6 h-6" />, roles: [Role.Admin, Role.Guru, Role.PenjagaSekolah] },
    { view: 'inventory', label: 'Inventaris', icon: <ArchiveBoxIcon className="w-6 h-6" />, roles: [Role.Admin, Role.Guru, Role.PenjagaSekolah] },
    { view: 'reports', label: 'Laporan', icon: <ReportIcon className="w-6 h-6" />, roles: [Role.Admin, Role.Guru, Role.PenjagaSekolah] },
    { view: 'users', label: 'Pengguna', icon: <UsersIcon className="w-6 h-6" />, roles: [Role.Admin]},
];

type HeaderProps = {
    onNavigate: (view: View) => void;
    activeView: View;
    currentUser: User;
    onLogout: () => void;
};
const Header: React.FC<HeaderProps> = ({ onNavigate, activeView, currentUser, onLogout }) => {
    
    const availableNavItems = NAV_ITEMS.filter(item => item.roles.includes(currentUser.role));

    return (
        <header className="bg-white shadow-sm sticky top-0 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-2">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <ArchiveBoxIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Ringkas Aset</h1>
                            <p className="text-xs text-slate-500 hidden sm:block">Inventaris Cepat, Laporan Tepat.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <nav className="hidden md:flex items-center space-x-4">
                            {availableNavItems.map(item => (
                                <button
                                    key={item.view}
                                    onClick={() => onNavigate(item.view)}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        activeView === item.view
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                         <div className="flex items-center space-x-3">
                             <div className="text-right hidden sm:block">
                                 <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                                 <p className="text-xs text-slate-500">{currentUser.role}</p>
                             </div>
                             <button onClick={onLogout} title="Logout" className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                </svg>
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

const BottomNav: React.FC<HeaderProps> = ({ onNavigate, activeView, currentUser }) => {
    const availableNavItems = NAV_ITEMS.filter(item => item.roles.includes(currentUser.role));

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.1)] z-20 flex justify-around">
             {availableNavItems.map(item => (
                <button
                    key={item.view}
                    onClick={() => onNavigate(item.view)}
                    className={`flex flex-col items-center justify-center pt-2 pb-1 w-full text-xs font-medium transition-colors ${
                        activeView === item.view
                            ? 'text-blue-600'
                            : 'text-slate-500 hover:bg-slate-100'
                    }`}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );
};


const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-white rounded-xl shadow-md p-4 sm:p-6 ${className}`}>
        {children}
    </div>
);

type DashboardProps = {
    fixedAssets: FixedAsset[];
    consumableAssets: ConsumableAsset[];
    onActionClick: (action: View | 'add' | 'take' | 'reportDamage') => void;
    currentUser: User;
};
const Dashboard: React.FC<DashboardProps> = ({ fixedAssets, consumableAssets, onActionClick, currentUser }) => {
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
        { label: "Lihat Laporan", icon: <ReportIcon className="w-8 h-8 text-purple-500" />, action: 'reports' },
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

// --- INVENTORY PAGE OPTIMIZATION COMPONENTS ---

const usePagination = <T,>(data: T[], itemsPerPage: number = 5) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    useEffect(() => {
        // Reset to page 1 if filtered data changes and current page is out of bounds
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (totalPages === 0) {
             setCurrentPage(1);
        }
    }, [data.length, totalPages, currentPage]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return data.slice(startIndex, startIndex + itemsPerPage);
    }, [data, currentPage, itemsPerPage]);

    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return {
        currentPage,
        totalPages,
        paginatedData,
        nextPage,
        prevPage,
        canGoNext: currentPage < totalPages,
        canGoPrev: currentPage > 1,
    };
};


type PaginationControlsProps = {
    currentPage: number;
    totalPages: number;
    onNext: () => void;
    onPrev: () => void;
    canGoNext: boolean;
    canGoPrev: boolean;
};
const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onNext, onPrev, canGoNext, canGoPrev }) => {
    if (totalPages <= 1) return null;
    
    return (
        <div className="flex items-center justify-between mt-4 px-2 py-2 border-t border-slate-200">
            <span className="text-sm text-slate-600">
                Halaman <span className="font-semibold">{currentPage}</span> dari <span className="font-semibold">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
                <button onClick={onPrev} disabled={!canGoPrev} className="px-3 py-1 text-sm font-medium border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors">
                    Sebelumnya
                </button>
                <button onClick={onNext} disabled={!canGoNext} className="px-3 py-1 text-sm font-medium border border-slate-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors">
                    Berikutnya
                </button>
            </div>
        </div>
    );
};


type EmptyStateProps = {
  message: string;
  onAction?: () => void;
  actionLabel?: string;
}
const EmptyState: React.FC<EmptyStateProps> = ({ message, onAction, actionLabel }) => (
    <div className="text-center py-16 px-6">
        <ArchiveBoxIcon className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-lg font-medium text-slate-800">Data Tidak Ditemukan</h3>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
        {onAction && actionLabel && (
             <div className="mt-6">
                <button
                    type="button"
                    onClick={onAction}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    {actionLabel}
                </button>
            </div>
        )}
    </div>
);


type FixedAssetTableProps = {
    assets: FixedAsset[];
    locationMap: Map<string, string>;
    onEditAsset: (asset: Asset) => void;
    onDeleteAsset: (assetId: string) => void;
};
const FixedAssetTable: React.FC<FixedAssetTableProps> = ({ assets, locationMap, onEditAsset, onDeleteAsset }) => {
    const { paginatedData, ...paginationProps } = usePagination(assets);

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 responsive-table">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Foto</th>
                            <th scope="col" className="px-6 py-3">Nama Aset</th>
                            <th scope="col" className="px-6 py-3">Kode</th>
                            <th scope="col" className="px-6 py-3">Lokasi</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-right">Harga</th>
                            <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(asset => (
                            <tr key={asset.id} className="bg-white border-b hover:bg-slate-50">
                                <td data-label="Foto" className="px-6 py-4 image-cell">
                                    <img src={asset.photoUrl} alt={asset.name} className="w-12 h-12 object-cover rounded-md mx-auto" />
                                </td>
                                <td data-label="Nama Aset" className="px-6 py-4 font-medium text-slate-900">{asset.name}</td>
                                <td data-label="Kode" className="px-6 py-4">{asset.code}</td>
                                <td data-label="Lokasi" className="px-6 py-4">{locationMap.get(asset.locationId) || 'N/A'}</td>
                                <td data-label="Status" className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        asset.status === AssetStatus.Baik ? 'bg-green-100 text-green-800' :
                                        asset.status === AssetStatus.RusakRingan ? 'bg-amber-100 text-amber-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>{asset.status}</span>
                                </td>
                                <td data-label="Harga" className="px-6 py-4 text-right">{formatCurrency(asset.price)}</td>
                                <td data-label="Aksi" className="px-6 py-4 text-center actions-cell">
                                    <div className="flex justify-center items-center gap-2">
                                        <button onClick={() => onEditAsset(asset)} className="p-2 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors" title="Ubah Aset">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onDeleteAsset(asset.id)} className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Hapus Aset">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls {...paginationProps} onNext={paginationProps.nextPage} onPrev={paginationProps.prevPage} />
        </>
    );
};

type ConsumableAssetTableProps = {
    assets: ConsumableAsset[];
    locationMap: Map<string, string>;
    onEditAsset: (asset: Asset) => void;
    onDeleteAsset: (assetId: string) => void;
};
const ConsumableAssetTable: React.FC<ConsumableAssetTableProps> = ({ assets, locationMap, onEditAsset, onDeleteAsset }) => {
    const { paginatedData, ...paginationProps } = usePagination(assets);

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 responsive-table">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nama Barang</th>
                            <th scope="col" className="px-6 py-3">Kode</th>
                            <th scope="col" className="px-6 py-3">Lokasi</th>
                            <th scope="col" className="px-6 py-3 text-center">Stok</th>
                            <th scope="col" className="px-6 py-3">Satuan</th>
                            <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(asset => (
                            <tr key={asset.id} className="bg-white border-b hover:bg-slate-50">
                                <td data-label="Nama Barang" className="px-6 py-4 font-medium text-slate-900">{asset.name}</td>
                                <td data-label="Kode" className="px-6 py-4">{asset.code}</td>
                                <td data-label="Lokasi" className="px-6 py-4">{locationMap.get(asset.locationId) || 'N/A'}</td>
                                <td data-label="Stok" className="px-6 py-4 text-center">{asset.quantity}</td>
                                <td data-label="Satuan" className="px-6 py-4">{asset.unit}</td>
                                <td data-label="Aksi" className="px-6 py-4 text-center actions-cell">
                                     <div className="flex justify-center items-center gap-2">
                                        <button onClick={() => onEditAsset(asset)} className="p-2 rounded-full text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors" title="Ubah Aset">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onDeleteAsset(asset.id)} className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors" title="Hapus Aset">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <PaginationControls {...paginationProps} onNext={paginationProps.nextPage} onPrev={paginationProps.prevPage} />
        </>
    );
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
const InventoryPage: React.FC<InventoryPageProps> = ({ fixedAssets, consumableAssets, locations, currentUser, onAddAsset, onEditAsset, onDeleteAsset, onManageLocations }) => {
    const [activeTab, setActiveTab] = useState<AssetType>(AssetType.Tetap);
    const locationMap = useMemo(() => new Map(locations.map(loc => [loc.id, loc.name])), [locations]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFixedAssets = useMemo(() => {
        return fixedAssets.filter(asset =>
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (locationMap.get(asset.locationId) || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [fixedAssets, searchTerm, locationMap]);

    const filteredConsumableAssets = useMemo(() => {
        return consumableAssets.filter(asset =>
            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (locationMap.get(asset.locationId) || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [consumableAssets, searchTerm, locationMap]);

    return (
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Daftar Inventaris</h2>
                    <p className="text-sm text-slate-500">Kelola semua aset tetap dan barang habis pakai.</p>
                </div>
                 <div className="flex items-center gap-2 flex-shrink-0">
                    {currentUser.role === Role.Admin && (
                        <button onClick={onManageLocations} className="flex items-center space-x-2 bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-md shadow-sm hover:bg-slate-50 transition-colors">
                            <Cog6ToothIcon className="w-5 h-5" />
                            <span>Kelola Ruangan</span>
                        </button>
                    )}
                    <button onClick={onAddAsset} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition-colors">
                        <PlusIcon className="w-5 h-5" />
                        <span>Tambah Barang</span>
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Cari berdasarkan nama, kode, atau lokasi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6">
                    <button
                        onClick={() => setActiveTab(AssetType.Tetap)}
                        className={`py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === AssetType.Tetap
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        Aset Tetap ({filteredFixedAssets.length})
                    </button>
                    <button
                        onClick={() => setActiveTab(AssetType.HabisPakai)}
                        className={`py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === AssetType.HabisPakai
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                    >
                        Barang Habis Pakai ({filteredConsumableAssets.length})
                    </button>
                </nav>
            </div>

            <div className="mt-4">
                {activeTab === AssetType.Tetap ? (
                    filteredFixedAssets.length > 0 ? (
                        <FixedAssetTable 
                            assets={filteredFixedAssets} 
                            locationMap={locationMap}
                            onEditAsset={onEditAsset}
                            onDeleteAsset={onDeleteAsset}
                        />
                    ) : (
                        <EmptyState 
                            message={searchTerm ? `Tidak ada aset tetap yang cocok dengan pencarian "${searchTerm}".` : "Belum ada aset tetap yang ditambahkan."}
                            actionLabel="Tambah Aset Tetap"
                            onAction={onAddAsset} 
                        />
                    )
                ) : (
                    filteredConsumableAssets.length > 0 ? (
                        <ConsumableAssetTable 
                            assets={filteredConsumableAssets}
                            locationMap={locationMap}
                            onEditAsset={onEditAsset}
                            onDeleteAsset={onDeleteAsset}
                        />
                    ) : (
                        <EmptyState 
                             message={searchTerm ? `Tidak ada barang yang cocok dengan pencarian "${searchTerm}".` : "Belum ada barang habis pakai yang ditambahkan."}
                             actionLabel="Tambah Barang Habis Pakai"
                             onAction={onAddAsset} 
                        />
                    )
                )}
            </div>
        </Card>
    );
};

const ReportsPage = () => {
    return (
        <Card>
            <h2 className="text-xl font-bold text-slate-800">Laporan</h2>
            <p className="text-slate-500 mt-2">Fitur laporan sedang dalam pengembangan. Segera hadir: laporan PDF dan ekspor Excel yang dapat disesuaikan.</p>
             <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
                <p className="font-semibold">Fitur "Wow" yang Akan Datang!</p>
                <ul className="list-disc list-inside mt-2 text-sm">
                    <li>Ringkasan eksekutif visual untuk Kepala Sekolah.</li>
                    <li>Grafik tren penggunaan ATK dan komposisi aset per ruangan.</li>
                    <li>Daftar Aksi: barang yang perlu dibeli dan aset yang butuh perhatian.</li>
                </ul>
            </div>
        </Card>
    )
}

type UsersPageProps = {
    users: User[];
    onAddUser: () => void;
    onEditUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
};
const UsersPage: React.FC<UsersPageProps> = ({ users, onAddUser, onEditUser, onDeleteUser }) => {
    return (
        <Card>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Manajemen Pengguna</h2>
                 <button onClick={onAddUser} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    <span>Tambah Pengguna</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500 responsive-table">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nama</th>
                            <th scope="col" className="px-6 py-3">Username</th>
                            <th scope="col" className="px-6 py-3">Peran</th>
                            <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="bg-white border-b hover:bg-slate-50">
                                <td data-label="Nama" className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                                <td data-label="Username" className="px-6 py-4">{user.username}</td>
                                <td data-label="Peran" className="px-6 py-4">{user.role}</td>
                                <td data-label="Aksi" className="px-6 py-4 text-center actions-cell">
                                    <div className="flex justify-center items-center gap-2">
                                        <button onClick={() => onEditUser(user)} className="p-2 text-slate-500 hover:text-blue-600 transition-colors" title="Ubah Pengguna">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onDeleteUser(user.id)} className="p-2 text-slate-500 hover:text-red-600 transition-colors" title="Hapus Pengguna">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

type TakeStockModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onTakeStock: (assetId: string, quantity: number) => void;
    consumableAssets: ConsumableAsset[];
};

const TakeStockModal: React.FC<TakeStockModalProps> = ({ isOpen, onClose, onTakeStock, consumableAssets }) => {
    const [selectedAssetId, setSelectedAssetId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);

    useEffect(() => {
        if (isOpen && consumableAssets.length > 0) {
            setSelectedAssetId(consumableAssets[0].id);
            setQuantity(1);
        } else if (isOpen) {
            setSelectedAssetId('');
        }
    }, [isOpen, consumableAssets]);

    if (!isOpen) return null;

    const selectedAsset = consumableAssets.find(a => a.id === selectedAssetId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssetId || quantity <= 0) {
            alert('Silakan pilih barang dan masukkan jumlah yang valid.');
            return;
        }
        if (selectedAsset && quantity > selectedAsset.quantity) {
             alert('Jumlah yang diambil melebihi stok yang tersedia.');
             return;
        }
        onTakeStock(selectedAssetId, quantity);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-slate-800">Ambil Stok Barang</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Pilih Barang</label>
                        <select value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)} className={INPUT_CLASSES} required>
                            <option value="" disabled>Pilih barang habis pakai...</option>
                            {consumableAssets.map(asset => (
                                <option key={asset.id} value={asset.id}>{asset.name} (Stok: {asset.quantity})</option>
                            ))}
                        </select>
                    </div>
                    {selectedAsset && (
                        <div className="p-3 bg-slate-50 rounded-md text-sm">
                            Stok Saat Ini: <span className="font-semibold">{selectedAsset.quantity} {selectedAsset.unit}</span>
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Jumlah Diambil</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            min="1"
                            max={selectedAsset?.quantity}
                            className={INPUT_CLASSES}
                            required
                        />
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Batal</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Ambil Stok</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

type ReportDamageModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onReportDamage: (assetId: string, newStatus: AssetStatus) => void;
    fixedAssets: FixedAsset[];
};

const ReportDamageModal: React.FC<ReportDamageModalProps> = ({ isOpen, onClose, onReportDamage, fixedAssets }) => {
    const [selectedAssetId, setSelectedAssetId] = useState<string>('');
    const [newStatus, setNewStatus] = useState<AssetStatus>(AssetStatus.RusakRingan);

    useEffect(() => {
        if (isOpen && fixedAssets.length > 0) {
            setSelectedAssetId(fixedAssets[0].id);
            setNewStatus(AssetStatus.RusakRingan);
        } else if (isOpen) {
             setSelectedAssetId('');
        }
    }, [isOpen, fixedAssets]);

    if (!isOpen) return null;

    const selectedAsset = fixedAssets.find(a => a.id === selectedAssetId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssetId) {
            alert('Silakan pilih aset yang akan dilaporkan.');
            return;
        }
        onReportDamage(selectedAssetId, newStatus);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-slate-800">Lapor Kerusakan Aset</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Pilih Aset</label>
                        <select value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)} className={INPUT_CLASSES} required>
                            <option value="" disabled>Pilih aset tetap...</option>
                            {fixedAssets.map(asset => (
                                <option key={asset.id} value={asset.id}>{asset.name} ({asset.code})</option>
                            ))}
                        </select>
                    </div>
                    {selectedAsset && (
                        <div className="p-3 bg-slate-50 rounded-md text-sm">
                            Status Saat Ini: <span className={`font-semibold ${
                                selectedAsset.status === AssetStatus.Baik ? 'text-green-700' :
                                selectedAsset.status === AssetStatus.RusakRingan ? 'text-amber-700' : 'text-red-700'
                            }`}>{selectedAsset.status}</span>
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Ubah Status Menjadi</label>
                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as AssetStatus)} className={INPUT_CLASSES} required>
                            {Object.values(AssetStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Batal</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700">Laporkan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


type AssetModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (asset: Asset) => void;
    locations: Location[];
    editingAsset: Asset | null;
    onAddLocation?: (newLocation: string) => string;
};

const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose, onSave, locations, editingAsset, onAddLocation }) => {
    const [assetType, setAssetType] = useState<AssetType>(AssetType.Tetap);
    const [formData, setFormData] = useState<Partial<Asset>>({});
    const [isAddingLocation, setIsAddingLocation] = useState(false);
    const [newLocationName, setNewLocationName] = useState('');

    useEffect(() => {
        if (editingAsset) {
            setAssetType(editingAsset.type);
            setFormData(editingAsset);
        } else {
            setAssetType(AssetType.Tetap);
            setFormData({ 
                type: AssetType.Tetap,
                locationId: locations.length === 1 ? locations[0].id : ''
            });
        }
        setIsAddingLocation(false);
        setNewLocationName('');
    }, [editingAsset, isOpen, locations]);
    
    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'add-new') {
            setIsAddingLocation(true);
        } else {
            setIsAddingLocation(false);
            setFormData(prev => ({ ...prev, locationId: value }));
        }
    };
    
    const handleSaveNewLocation = () => {
        if (!onAddLocation) return;
        const trimmedName = newLocationName.trim();
        if (trimmedName === '') {
            alert('Nama lokasi tidak boleh kosong.');
            return;
        }
        if (locations.some(loc => loc.name.toLowerCase() === trimmedName.toLowerCase())) {
            alert('Nama lokasi sudah ada.');
            return;
        }
        
        const newLocationId = onAddLocation(trimmedName);
        setFormData(prev => ({ ...prev, locationId: newLocationId }));
        setIsAddingLocation(false);
        setNewLocationName('');
    };

    const handleCancelAddLocation = () => {
        setIsAddingLocation(false);
        setNewLocationName('');
    };


    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'quantity' ? Number(value) : value }));
    };

    const handleTypeChange = (type: AssetType) => {
        setAssetType(type);
        setFormData({ 
            type,
            locationId: locations.length === 1 ? locations[0].id : ''
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalAsset: Asset = {
            id: editingAsset?.id || `new-${Date.now()}`,
            ...formData
        } as Asset;
        onSave(finalAsset);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-slate-800">{editingAsset ? 'Ubah' : 'Tambah'} Barang Baru</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                 <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
                     <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                        <button type="button" onClick={() => handleTypeChange(AssetType.Tetap)} className={`px-3 py-2 text-sm font-medium rounded-md ${assetType === AssetType.Tetap ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}>
                            {AssetType.Tetap}
                        </button>
                         <button type="button" onClick={() => handleTypeChange(AssetType.HabisPakai)} className={`px-3 py-2 text-sm font-medium rounded-md ${assetType === AssetType.HabisPakai ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}>
                            {AssetType.HabisPakai}
                        </button>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">Nama Barang</label>
                        <input name="name" onChange={handleChange} value={formData.name || ''} className={INPUT_CLASSES} required />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Kode Barang</label>
                        <input name="code" onChange={handleChange} value={formData.code || ''} className={INPUT_CLASSES} required />
                    </div>

                    {assetType === AssetType.Tetap ? (
                        <>
                             <div>
                                <label className="text-sm font-medium text-slate-700">Lokasi</label>
                                {isAddingLocation ? (
                                    <div className="mt-1 flex items-center gap-2">
                                        <input 
                                            type="text"
                                            value={newLocationName}
                                            onChange={(e) => setNewLocationName(e.target.value)}
                                            placeholder="Nama lokasi baru..."
                                            className={`${INPUT_CLASSES} !mt-0 flex-grow`}
                                            autoFocus
                                        />
                                        <button type="button" onClick={handleSaveNewLocation} className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Simpan</button>
                                        <button type="button" onClick={handleCancelAddLocation} className="px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Batal</button>
                                    </div>
                                ) : (
                                    <select name="locationId" onChange={handleLocationChange} value={(formData as FixedAsset).locationId || ''} className={INPUT_CLASSES} required>
                                        <option value="" disabled>Pilih Lokasi</option>
                                        {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                        { onAddLocation && <option value="add-new" className="text-blue-600 font-semibold">✚ Tambah Lokasi Baru...</option>}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Tanggal Pembelian</label>
                                <input type="date" name="purchaseDate" onChange={handleChange} value={(formData as FixedAsset).purchaseDate || ''} className={INPUT_CLASSES} required />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Harga</label>
                                <input type="number" name="price" onChange={handleChange} value={(formData as FixedAsset).price || ''} className={INPUT_CLASSES} required />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Status</label>
                                <select name="status" onChange={handleChange} value={(formData as FixedAsset).status || AssetStatus.Baik} className={INPUT_CLASSES} required>
                                    {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-slate-700">URL Foto</label>
                                <input name="photoUrl" onChange={handleChange} value={(formData as FixedAsset).photoUrl || ''} className={INPUT_CLASSES} placeholder="https://picsum.photos/..." />
                            </div>
                        </>
                    ) : (
                         <>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Lokasi</label>
                                <select name="locationId" onChange={handleChange} value={(formData as ConsumableAsset).locationId || ''} className={INPUT_CLASSES} required>
                                    <option value="" disabled>Pilih Lokasi</option>
                                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Jumlah</label>
                                    <input type="number" name="quantity" onChange={handleChange} value={(formData as ConsumableAsset).quantity || ''} className={INPUT_CLASSES} required />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Satuan</label>
                                    <input name="unit" onChange={handleChange} value={(formData as ConsumableAsset).unit || ''} className={INPUT_CLASSES} required placeholder="e.g. rim, buah" />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Batal</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

type UserModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User) => void;
    locations: Location[];
    editingUser: User | null;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, locations, editingUser }) => {
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if (editingUser) {
            setFormData({ ...editingUser, password: '' }); // Clear password field for editing
        } else {
            setFormData({
                role: Role.Guru, // Default role
                responsibleLocationIds: [],
            });
        }
    }, [editingUser, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as Role;
        setFormData(prev => ({
            ...prev,
            role: newRole,
            // Reset responsible locations if role is Admin
            responsibleLocationIds: newRole === Role.Admin ? [] : prev.responsibleLocationIds || []
        }));
    };

    const handleLocationCheckboxChange = (locationId: string) => {
        setFormData(prev => {
            const currentIds = prev.responsibleLocationIds || [];
            const newIds = currentIds.includes(locationId)
                ? currentIds.filter(id => id !== locationId)
                : [...currentIds, locationId];
            return { ...prev, responsibleLocationIds: newIds };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser && !formData.password) {
            alert('Password wajib diisi untuk pengguna baru.');
            return;
        }
        const finalUser: User = {
            id: editingUser?.id || `user-${Date.now()}`,
            name: formData.name || '',
            username: formData.username || '',
            role: formData.role || Role.Guru,
            responsibleLocationIds: formData.role === Role.Admin ? [] : formData.responsibleLocationIds || [],
            ...(formData.password && { password: formData.password }), // Only include password if it was changed
        };
        onSave(finalUser);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-slate-800">{editingUser ? 'Ubah' : 'Tambah'} Pengguna</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                        <input name="name" onChange={handleChange} value={formData.name || ''} className={INPUT_CLASSES} required />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-slate-700">Username</label>
                        <input name="username" onChange={handleChange} value={formData.username || ''} className={INPUT_CLASSES} required />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-slate-700">Password</label>
                        <input type="password" name="password" onChange={handleChange} value={formData.password || ''} className={INPUT_CLASSES} placeholder={editingUser ? 'Kosongkan jika tidak ingin diubah' : ''} required={!editingUser} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Peran</label>
                        <select name="role" onChange={handleRoleChange} value={formData.role || Role.Guru} className={INPUT_CLASSES} required>
                            {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    
                    {formData.role && formData.role !== Role.Admin && (
                        <div>
                            <label className="text-sm font-medium text-slate-700">Bertanggung Jawab untuk Ruangan</label>
                            <div className="mt-2 p-3 border border-slate-200 rounded-md max-h-40 overflow-y-auto space-y-2">
                                {locations.map(loc => (
                                    <label key={loc.id} className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={(formData.responsibleLocationIds || []).includes(loc.id)}
                                            onChange={() => handleLocationCheckboxChange(loc.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-800">{loc.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Batal</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

type ManageLocationsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    locations: Location[];
    onAdd: (name: string) => void;
    onDelete: (id: string) => void;
}

const ManageLocationsModal: React.FC<ManageLocationsModalProps> = ({ isOpen, onClose, locations, onAdd, onDelete }) => {
    const [newLocationName, setNewLocationName] = useState('');

    const handleAdd = () => {
        const trimmedName = newLocationName.trim();
        if (trimmedName) {
            onAdd(trimmedName);
            setNewLocationName('');
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-slate-800">Kelola Ruangan</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="mb-4">
                        <label className="text-sm font-medium text-slate-700">Tambah Ruangan Baru</label>
                        <div className="mt-1 flex gap-2">
                            <input
                                type="text"
                                value={newLocationName}
                                onChange={(e) => setNewLocationName(e.target.value)}
                                placeholder="e.g. Laboratorium Komputer"
                                className={INPUT_CLASSES + ' !mt-0'}
                            />
                            <button onClick={handleAdd} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                Tambah
                            </button>
                        </div>
                    </div>
                    
                    <h4 className="text-sm font-medium text-slate-700 mt-6 mb-2">Daftar Ruangan Saat Ini</h4>
                    <ul className="space-y-2 border rounded-md p-2 max-h-60 overflow-y-auto">
                        {locations.length > 0 ? locations.map(loc => (
                            <li key={loc.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded">
                                <span className="text-slate-800">{loc.name}</span>
                                <button onClick={() => onDelete(loc.id)} className="p-1 text-slate-400 hover:text-red-600" title="Hapus Ruangan">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </li>
                        )) : (
                            <p className="text-slate-500 text-sm text-center p-4">Belum ada ruangan.</p>
                        )}
                    </ul>
                </div>
                <div className="p-4 border-t flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [view, setView] = useState<View>('dashboard');
    const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
    const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>(INITIAL_FIXED_ASSETS);
    const [consumableAssets, setConsumableAssets] = useState<ConsumableAsset[]>(INITIAL_CONSUMABLE_ASSETS);
    const [users, setUsers] = useState<User[]>(USERS_DATA);
    
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [isTakeStockModalOpen, setIsTakeStockModalOpen] = useState(false);
    const [isReportDamageModalOpen, setIsReportDamageModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isManageLocationsModalOpen, setIsManageLocationsModalOpen] = useState(false);

    // Filter data based on user's role and responsibilities
    const visibleFixedAssets = useMemo(() => {
        if (!currentUser || currentUser.role === Role.Admin) {
            return fixedAssets;
        }
        return fixedAssets.filter(asset => currentUser.responsibleLocationIds.includes(asset.locationId));
    }, [currentUser, fixedAssets]);

    const visibleConsumableAssets = useMemo(() => {
        if (!currentUser || currentUser.role === Role.Admin) {
            return consumableAssets;
        }
        return consumableAssets.filter(asset => currentUser.responsibleLocationIds.includes(asset.locationId));
    }, [currentUser, consumableAssets]);

     const visibleLocations = useMemo(() => {
        if (!currentUser || currentUser.role === Role.Admin) {
            return locations;
        }
        return locations.filter(loc => currentUser.responsibleLocationIds.includes(loc.id));
    }, [currentUser, locations]);


    const handleLogin = useCallback(async (username: string, password: string): Promise<void> => {
        const { user } = await authenticate(username, password);
        setCurrentUser(user);
    }, []);

    const handleLogout = useCallback(() => {
        setCurrentUser(null);
        setView('dashboard');
    }, []);
    
    const handleNavigation = useCallback((targetView: View) => {
        setView(targetView);
    }, []);

    const handleDashboardAction = useCallback((action: View | 'add' | 'take' | 'reportDamage') => {
        if (action === 'add') {
            setEditingAsset(null);
            setIsAssetModalOpen(true);
        } else if (action === 'reports') {
            setView('reports');
        } else if (action === 'take') {
            setIsTakeStockModalOpen(true);
        } else if (action === 'reportDamage') {
            setIsReportDamageModalOpen(true);
        } else {
            alert(`Aksi "${action}" belum diimplementasikan.`);
        }
    }, []);
    
    const handleSaveAsset = useCallback((asset: Asset) => {
        if (asset.type === AssetType.Tetap) {
             setFixedAssets(prev => {
                const index = prev.findIndex(a => a.id === asset.id);
                if (index > -1) {
                    const newAssets = [...prev];
                    newAssets[index] = asset as FixedAsset;
                    return newAssets;
                }
                return [...prev, asset as FixedAsset];
            });
        } else {
            setConsumableAssets(prev => {
                 const index = prev.findIndex(a => a.id === asset.id);
                if (index > -1) {
                    const newAssets = [...prev];
                    newAssets[index] = asset as ConsumableAsset;
                    return newAssets;
                }
                return [...prev, asset as ConsumableAsset];
            });
        }
        setIsAssetModalOpen(false);
        setEditingAsset(null);
    }, []);

    const handleAddAssetClick = useCallback(() => {
        setEditingAsset(null);
        setIsAssetModalOpen(true);
    }, []);

    const handleEditAssetClick = useCallback((asset: Asset) => {
        setEditingAsset(asset);
        setIsAssetModalOpen(true);
    }, []);

    const handleDeleteAsset = useCallback((assetId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus aset ini?')) {
            setFixedAssets(prev => prev.filter(a => a.id !== assetId));
            setConsumableAssets(prev => prev.filter(a => a.id !== assetId));
        }
    }, []);

    const handleAddUserClick = useCallback(() => {
        setEditingUser(null);
        setIsUserModalOpen(true);
    }, []);

    const handleEditUserClick = useCallback((user: User) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    }, []);
    
    const handleSaveUser = useCallback((user: User) => {
        setUsers(prev => {
            const index = prev.findIndex(u => u.id === user.id);
            if (index > -1) {
                const newUsers = [...prev];
                const existingUser = newUsers[index];
                // Keep existing password if not provided in the update, otherwise use new one
                newUsers[index] = { ...existingUser, ...user, password: user.password ? user.password : existingUser.password };
                return newUsers;
            }
             // For new users, a password must be provided
            if (!user.password) {
                 alert("Password wajib diisi untuk pengguna baru.");
                 return prev; // Do not update state if validation fails
            }
            return [...prev, user];
        });
        setIsUserModalOpen(false);
        setEditingUser(null);
    }, []);


    const handleDeleteUser = useCallback((userId: string) => {
        if (currentUser?.id === userId) {
            alert("Anda tidak dapat menghapus diri sendiri.");
            return;
        }
        if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    }, [currentUser]);

    const handleAddLocation = useCallback((newLocationName: string): string => {
        const newLocation: Location = {
            id: `loc-${Date.now()}`,
            name: newLocationName,
        };
        setLocations(prev => [...prev, newLocation]);
        return newLocation.id;
    }, []);
    
    const handleAddLocationFromModal = useCallback((name: string) => {
        const trimmedName = name.trim();
        if (locations.some(loc => loc.name.toLowerCase() === trimmedName.toLowerCase())) {
            alert('Nama lokasi sudah ada.');
            return;
        }
        handleAddLocation(trimmedName);
    }, [locations, handleAddLocation]);

    const handleDeleteLocation = useCallback((locationId: string) => {
        const isUsed = fixedAssets.some(a => a.locationId === locationId) || 
                       consumableAssets.some(a => a.locationId === locationId);

        if (isUsed) {
            alert('Lokasi ini tidak dapat dihapus karena masih digunakan oleh satu atau lebih aset.');
            return;
        }

        if (window.confirm('Apakah Anda yakin ingin menghapus lokasi ini?')) {
            setLocations(prev => prev.filter(loc => loc.id !== locationId));
        }
    }, [fixedAssets, consumableAssets]);

    const handleTakeStock = useCallback((assetId: string, quantityToTake: number) => {
        setConsumableAssets(prev => {
            const newAssets = [...prev];
            const assetIndex = newAssets.findIndex(a => a.id === assetId);
            if (assetIndex > -1) {
                const currentQuantity = newAssets[assetIndex].quantity;
                if (quantityToTake > currentQuantity) {
                    alert('Jumlah yang diambil melebihi stok yang tersedia.');
                    return prev; 
                }
                newAssets[assetIndex].quantity -= quantityToTake;
                alert(`Berhasil mengambil ${quantityToTake} ${newAssets[assetIndex].unit} ${newAssets[assetIndex].name}.`);
            }
            return newAssets;
        });
        setIsTakeStockModalOpen(false);
    }, []);

    const handleReportDamage = useCallback((assetId: string, newStatus: AssetStatus) => {
        setFixedAssets(prev => {
            const newAssets = [...prev];
            const assetIndex = newAssets.findIndex(a => a.id === assetId);
            if (assetIndex > -1) {
                newAssets[assetIndex].status = newStatus;
                alert(`Status ${newAssets[assetIndex].name} berhasil diperbarui menjadi "${newStatus}".`);
            }
            return newAssets;
        });
        setIsReportDamageModalOpen(false);
    }, []);

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard fixedAssets={visibleFixedAssets} consumableAssets={visibleConsumableAssets} onActionClick={handleDashboardAction} currentUser={currentUser} />;
            case 'inventory':
                return <InventoryPage fixedAssets={visibleFixedAssets} consumableAssets={visibleConsumableAssets} locations={locations} currentUser={currentUser} onAddAsset={handleAddAssetClick} onEditAsset={handleEditAssetClick} onDeleteAsset={handleDeleteAsset} onManageLocations={() => setIsManageLocationsModalOpen(true)} />;
            case 'reports':
                return <ReportsPage />;
            case 'users':
                return <UsersPage users={users} onAddUser={handleAddUserClick} onEditUser={handleEditUserClick} onDeleteUser={handleDeleteUser} />;
            default:
                return <div>Halaman tidak ditemukan</div>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 pb-24 md:pb-8">
            <Header onNavigate={handleNavigation} activeView={view} currentUser={currentUser} onLogout={handleLogout} />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {renderView()}
            </main>
            <BottomNav onNavigate={handleNavigation} activeView={view} currentUser={currentUser} onLogout={handleLogout} />
            <AssetModal 
                isOpen={isAssetModalOpen} 
                onClose={() => setIsAssetModalOpen(false)} 
                onSave={handleSaveAsset} 
                locations={visibleLocations}
                editingAsset={editingAsset}
                onAddLocation={currentUser.role === Role.Admin ? handleAddLocation : undefined}
            />
             <TakeStockModal
                isOpen={isTakeStockModalOpen}
                onClose={() => setIsTakeStockModalOpen(false)}
                onTakeStock={handleTakeStock}
                consumableAssets={visibleConsumableAssets}
            />
            <ReportDamageModal
                isOpen={isReportDamageModalOpen}
                onClose={() => setIsReportDamageModalOpen(false)}
                onReportDamage={handleReportDamage}
                fixedAssets={visibleFixedAssets}
            />
            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSave={handleSaveUser}
                editingUser={editingUser}
                locations={locations}
            />
            <ManageLocationsModal
                isOpen={isManageLocationsModalOpen}
                onClose={() => setIsManageLocationsModalOpen(false)}
                locations={locations}
                onAdd={handleAddLocationFromModal}
                onDelete={handleDeleteLocation}
            />
        </div>
    );
};

export default App;
