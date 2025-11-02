export enum Role {
  Admin = 'Admin',
  Guru = 'Guru',
  PenjagaSekolah = 'Penjaga Sekolah',
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string; // Password is optional as it won't be stored in frontend state
  role: Role;
  responsibleLocationIds: string[]; // Admin has all, others have specific ones
}

export enum AssetStatus {
  Baik = 'Baik',
  RusakRingan = 'Rusak Ringan',
  RusakBerat = 'Rusak Berat',
}

export enum AssetType {
  Tetap = 'Aset Tetap',
  HabisPakai = 'Barang Habis Pakai',
}

export interface Location {
  id: string;
  name: string;
}

export interface FixedAsset {
  id: string;
  name: string;
  code: string;
  type: AssetType.Tetap;
  locationId: string;
  purchaseDate: string;
  price: number;
  status: AssetStatus;
  photoUrl: string;
}

export interface ConsumableAsset {
  id:string;
  name: string;
  code: string;
  type: AssetType.HabisPakai;
  quantity: number;
  unit: string;
  locationId: string;
}

export type Asset = FixedAsset | ConsumableAsset;
