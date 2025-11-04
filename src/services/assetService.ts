import { supabase } from './supabaseClient';
import { FixedAsset, ConsumableAsset, Asset } from '../types';

export const fetchLocations = async () => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
};

export const fetchFixedAssets = async () => {
  const { data, error } = await supabase
    .from('fixed_assets')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data || []).map(asset => ({
    ...asset,
    locationId: asset.location_id,
    purchaseDate: asset.purchase_date,
    photoUrl: asset.photo_url,
  })) as FixedAsset[];
};

export const fetchConsumableAssets = async () => {
  const { data, error } = await supabase
    .from('consumable_assets')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data || []).map(asset => ({
    ...asset,
    locationId: asset.location_id,
  })) as ConsumableAsset[];
};

export const createFixedAsset = async (asset: Omit<FixedAsset, 'id'>) => {
  const { data, error } = await supabase
    .from('fixed_assets')
    .insert({
      name: asset.name,
      code: asset.code,
      type: asset.type,
      location_id: asset.locationId,
      purchase_date: asset.purchaseDate,
      price: asset.price,
      status: asset.status,
      photo_url: asset.photoUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateFixedAsset = async (id: string, updates: Partial<FixedAsset>) => {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.code) updateData.code = updates.code;
  if (updates.locationId) updateData.location_id = updates.locationId;
  if (updates.purchaseDate) updateData.purchase_date = updates.purchaseDate;
  if (updates.price !== undefined) updateData.price = updates.price;
  if (updates.status) updateData.status = updates.status;
  if (updates.photoUrl) updateData.photo_url = updates.photoUrl;

  const { data, error } = await supabase
    .from('fixed_assets')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteFixedAsset = async (id: string) => {
  const { error } = await supabase
    .from('fixed_assets')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const createConsumableAsset = async (asset: Omit<ConsumableAsset, 'id'>) => {
  const { data, error } = await supabase
    .from('consumable_assets')
    .insert({
      name: asset.name,
      code: asset.code,
      type: asset.type,
      quantity: asset.quantity,
      unit: asset.unit,
      location_id: asset.locationId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateConsumableAsset = async (id: string, updates: Partial<ConsumableAsset>) => {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.code) updateData.code = updates.code;
  if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
  if (updates.unit) updateData.unit = updates.unit;
  if (updates.locationId) updateData.location_id = updates.locationId;

  const { data, error } = await supabase
    .from('consumable_assets')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteConsumableAsset = async (id: string) => {
  const { error } = await supabase
    .from('consumable_assets')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const createTransaction = async (
  assetId: string | null,
  assetType: 'Tetap' | 'HabisPakai',
  userId: string,
  transactionType: 'Tambah' | 'Ambil' | 'Lapor Rusak' | 'Edit',
  quantityChange?: number,
  notes?: string
) => {
  const { error } = await supabase
    .from('asset_transactions')
    .insert({
      asset_id: assetId,
      asset_type: assetType,
      user_id: userId,
      transaction_type: transactionType,
      quantity_change: quantityChange,
      notes,
    });

  if (error) throw error;
};

export const uploadAssetPhoto = async (file: File, assetCode: string) => {
  const fileName = `${assetCode}-${Date.now()}.${file.name.split('.').pop()}`;

  const { data, error } = await supabase.storage
    .from('asset-photos')
    .upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('asset-photos')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};
