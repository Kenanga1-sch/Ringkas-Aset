import React, { useState, useEffect } from 'react';
import { supabase, signUp, signIn, signOut, getCurrentUser, getUserProfile } from './services/supabaseClient';
import { fetchLocations, fetchFixedAssets, fetchConsumableAssets, createFixedAsset, updateFixedAsset, deleteFixedAsset, createConsumableAsset, updateConsumableAsset, deleteConsumableAsset, createTransaction, uploadAssetPhoto } from './services/assetService';
import { FixedAsset, ConsumableAsset, Location, AssetStatus, AssetType, Role, User, Asset } from './types';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import InventoryPage from './components/InventoryPage';
import ReportsPage from './components/ReportsPage';
import UsersPage from './components/UsersPage';
import AssetModal from './components/AssetModal';

type View = 'dashboard' | 'inventory' | 'reports' | 'users';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<(User & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<View>('dashboard');

  const [locations, setLocations] = useState<Location[]>([]);
  const [fixedAssets, setFixedAssets] = useState<FixedAsset[]>([]);
  const [consumableAssets, setConsumableAssets] = useState<ConsumableAsset[]>([]);

  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [assetModalMode, setAssetModalMode] = useState<'add' | 'edit' | 'take' | 'reportDamage'>('add');

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    return () => subscription?.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const profile = await getUserProfile(user.id);
        if (profile) {
          setCurrentUser({
            id: user.id,
            name: profile.name,
            role: profile.role as Role,
            responsibleLocationIds: profile.responsible_location_ids || [],
          });
          await loadData();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [locData, fixedData, consumableData] = await Promise.all([
        fetchLocations(),
        fetchFixedAssets(),
        fetchConsumableAssets(),
      ]);
      setLocations(locData);
      setFixedAssets(fixedData);
      setConsumableAssets(consumableData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      await checkAuth();
    } catch (error) {
      throw error;
    }
  };

  const handleSignUp = async (name: string, email: string, password: string, role: string) => {
    try {
      await signUp(email, password, { name, role });
      await checkAuth();
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setActiveView('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddAsset = () => {
    setEditingAsset(null);
    setAssetModalMode('add');
    setShowAssetModal(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetModalMode('edit');
    setShowAssetModal(true);
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus aset ini?')) return;
    try {
      const asset = fixedAssets.find(a => a.id === assetId) || consumableAssets.find(a => a.id === assetId);
      if (asset) {
        if ('price' in asset) {
          await deleteFixedAsset(assetId);
          await createTransaction(assetId, 'Tetap', currentUser!.id, 'Edit', undefined, 'Aset dihapus');
        } else {
          await deleteConsumableAsset(assetId);
          await createTransaction(assetId, 'HabisPakai', currentUser!.id, 'Edit', undefined, 'Barang dihapus');
        }
        await loadData();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus aset');
    }
  };

  const handleSaveAsset = async (data: any) => {
    try {
      if (assetModalMode === 'add') {
        if (data.type === AssetType.Tetap) {
          await createFixedAsset(data);
          await createTransaction(null, 'Tetap', currentUser!.id, 'Tambah', undefined, 'Aset baru ditambahkan');
        } else {
          await createConsumableAsset(data);
          await createTransaction(null, 'HabisPakai', currentUser!.id, 'Tambah', undefined, 'Barang baru ditambahkan');
        }
      } else if (assetModalMode === 'edit' && editingAsset) {
        if ('price' in editingAsset) {
          await updateFixedAsset(editingAsset.id, data);
          await createTransaction(editingAsset.id, 'Tetap', currentUser!.id, 'Edit', undefined, 'Aset diperbarui');
        } else {
          await updateConsumableAsset(editingAsset.id, data);
          await createTransaction(editingAsset.id, 'HabisPakai', currentUser!.id, 'Edit', undefined, 'Barang diperbarui');
        }
      } else if (assetModalMode === 'take' && editingAsset) {
        const quantityChange = parseInt(data.quantityChange) || 0;
        await updateConsumableAsset(editingAsset.id, {
          quantity: ('quantity' in editingAsset ? editingAsset.quantity : 0) - quantityChange,
        });
        await createTransaction(editingAsset.id, 'HabisPakai', currentUser!.id, 'Ambil', quantityChange, data.notes);
      } else if (assetModalMode === 'reportDamage' && editingAsset) {
        if ('price' in editingAsset) {
          await updateFixedAsset(editingAsset.id, { status: data.status });
          await createTransaction(editingAsset.id, 'Tetap', currentUser!.id, 'Lapor Rusak', undefined, data.notes);
        }
      }
      setShowAssetModal(false);
      await loadData();
    } catch (error) {
      console.error('Save error:', error);
      alert('Gagal menyimpan aset');
    }
  };

  const handleTakeStock = () => {
    if (consumableAssets.length === 0) {
      alert('Tidak ada barang habis pakai yang tersedia');
      return;
    }
    setEditingAsset(consumableAssets[0]);
    setAssetModalMode('take');
    setShowAssetModal(true);
  };

  const handleReportDamage = () => {
    if (fixedAssets.length === 0) {
      alert('Tidak ada aset tetap yang tersedia');
      return;
    }
    setEditingAsset(fixedAssets[0]);
    setAssetModalMode('reportDamage');
    setShowAssetModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-24 md:pb-0">
      <Header
        onNavigate={setActiveView}
        activeView={activeView}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'dashboard' && (
          <Dashboard
            fixedAssets={fixedAssets}
            consumableAssets={consumableAssets}
            locations={locations}
            currentUser={currentUser}
            onActionClick={(action) => {
              if (action === 'add') handleAddAsset();
              else if (action === 'take') handleTakeStock();
              else if (action === 'reportDamage') handleReportDamage();
              else if (action === 'reports') setActiveView('reports');
            }}
          />
        )}
        {activeView === 'inventory' && (
          <InventoryPage
            fixedAssets={fixedAssets}
            consumableAssets={consumableAssets}
            locations={locations}
            currentUser={currentUser}
            onAddAsset={handleAddAsset}
            onEditAsset={handleEditAsset}
            onDeleteAsset={handleDeleteAsset}
            onManageLocations={() => {}}
          />
        )}
        {activeView === 'reports' && (
          <ReportsPage
            fixedAssets={fixedAssets}
            consumableAssets={consumableAssets}
            locations={locations}
          />
        )}
        {activeView === 'users' && currentUser.role === Role.Admin && (
          <UsersPage
            currentUser={currentUser}
            onDataChange={loadData}
          />
        )}
      </main>

      <BottomNav
        onNavigate={setActiveView}
        activeView={activeView}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {showAssetModal && (
        <AssetModal
          mode={assetModalMode}
          asset={editingAsset}
          locations={locations}
          fixedAssets={fixedAssets}
          consumableAssets={consumableAssets}
          onSave={handleSaveAsset}
          onClose={() => setShowAssetModal(false)}
        />
      )}
    </div>
  );
};

export default App;
