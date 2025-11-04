# Ringkas Aset - Sistem Manajemen Inventaris Sekolah

**Inventaris Cepat, Laporan Tepat** - Aplikasi web modern untuk manajemen aset dan inventaris di sekolah.

## Fitur Utama

- **Dashboard Interaktif**: Visualisasi real-time status aset, nilai inventaris, dan statistik penting
- **Manajemen Aset Tetap**: Kelola laptop, meja, kursi, AC, dan aset lainnya dengan foto dan tracking status
- **Manajemen Barang Habis Pakai**: Pantau stok kertas, spidol, tinta printer, dan perlengkapan sekolah lainnya
- **Sistem Pelaporan**: Generate laporan PDF dengan grafik dan detail aset berdasarkan periode
- **Multi-Role Access**: Admin, Guru, dan Penjaga Sekolah dengan hak akses yang berbeda
- **Laporan Kerusakan**: Catat dan lacak aset yang rusak dengan catatan detail
- **Tracking Transaksi**: Semua perubahan data tercatat dalam log audit untuk transparansi

## Stack Teknologi

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Cloud Functions**: Supabase Edge Functions untuk AI integration
- **Visualization**: Recharts untuk grafik dan analitik
- **PDF Export**: jsPDF untuk laporan

## Instalasi dan Setup

### Persyaratan
- Node.js 16+
- npm atau yarn

### Step-by-Step

1. **Clone repository dan install dependencies:**
   ```bash
   npm install
   ```

2. **Konfigurasi Supabase:**
   - File `.env` sudah berisi kredensial Supabase
   - Database schema dan migrations otomatis diterapkan

3. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173`

4. **Build untuk production:**
   ```bash
   npm run build
   npm run preview
   ```

## Penggunaan

### Login/Registrasi
- Klik tombol "Belum punya akun? Daftar" di halaman login
- Isi nama lengkap, email, pilih role (Admin/Guru/Penjaga Sekolah), dan password
- Atau gunakan akun yang sudah ada

### Dashboard
- Lihat ringkasan nilai aset total dan jumlah aset yang rusak
- Akses cepat ke fitur tambah barang, ambil stok, lapor rusak, dan lihat laporan
- Grafik status aset tetap dan stok barang terendah

### Inventaris
- Tab "Aset Tetap": Kelola laptop, meja, furnitur, AC, dan aset lainnya
- Tab "Barang Habis Pakai": Kelola kertas, spidol, tinta, dan perlengkapan
- Cari berdasarkan nama atau kode
- Filter berdasarkan lokasi (Ruang Guru, Perpustakaan, Kelas, Gudang, dll)
- Edit atau hapus item dengan tombol aksi

### Laporan
- Filter data aset berdasarkan periode (tanggal pembelian)
- Lihat ringkasan: jumlah aset, nilai total, aset baru, dan aset rusak
- Lihat grafik: nilai aset per lokasi dan tren akuisisi aset
- Generate dan download laporan dalam format PDF

### Manajemen Pengguna
- Hanya Admin yang dapat mengakses menu Pengguna
- Pengguna baru dapat mendaftar melalui formulir registrasi

## Alur Kerja Umum

### 1. Tambah Aset Baru
- Dashboard → Tambah Barang, atau
- Menu Inventaris → Tambah Barang
- Pilih tipe (Aset Tetap atau Barang Habis Pakai)
- Isi detail sesuai tipe
- Simpan

### 2. Ambil Stok Barang Habis Pakai
- Dashboard → Ambil Stok
- Pilih barang dari dropdown
- Masukkan jumlah yang diambil
- Tambah catatan (opsional)
- Simpan

### 3. Lapor Aset Rusak
- Dashboard → Lapor Rusak
- Pilih aset yang rusak
- Tentukan tingkat kerusakan (Ringan/Berat)
- Jelaskan kondisi kerusakan
- Simpan

### 4. Generate Laporan
- Menu Laporan
- Filter periode (dari tanggal - sampai tanggal)
- Lihat statistik dan grafik
- Klik "Cetak Laporan PDF" untuk download

## Struktur Basis Data

### Tabel Utama
- **locations**: Lokasi tempat aset disimpan
- **user_profiles**: Data profil pengguna (diperluas dari auth.users)
- **fixed_assets**: Aset tetap (laptop, meja, kursi, AC, dll)
- **consumable_assets**: Barang habis pakai (kertas, spidol, tinta, dll)
- **asset_transactions**: Log audit semua perubahan data

### Row Level Security (RLS)
- Setiap tabel dilindungi RLS policies
- Pengguna hanya bisa akses data yang relevan dengan role mereka
- Admin memiliki akses penuh

## Fitur Keamanan

- ✅ Authentication berbasis email/password dengan Supabase Auth
- ✅ Tidak ada password yang disimpan di frontend
- ✅ Row Level Security pada setiap tabel
- ✅ Semua transaksi dicatat dalam asset_transactions
- ✅ API key Supabase dibuat anonymously (public access terbatas)

## API Edge Functions

### Gemini AI Assistant
- **Endpoint**: `/functions/v1/gemini-assistant`
- **Method**: POST
- **Body**:
  ```json
  {
    "query": "pertanyaan tentang inventaris",
    "inventoryData": [...]
  }
  ```
- **Response**:
  ```json
  {
    "response": "jawaban dari AI"
  }
  ```

## Troubleshooting

### Build error
- Pastikan Node.js versi 16 atau lebih tinggi
- Jalankan `npm install` ulang
- Bersihkan cache: `npm cache clean --force`

### Database error
- Periksa koneksi internet
- Verifikasi `.env` sudah benar
- Pastikan database sudah terinisialisasi dengan migrations

### Login tidak berfungsi
- Bersihkan cookie browser
- Pastikan email valid dan unique
- Password minimal 6 karakter

## Pengembangan Lanjutan

Untuk menambah fitur atau menyesuaikan:

1. **Komponen React**: Edit file di `src/components/`
2. **Services**: Tambah logika di `src/services/`
3. **Database**: Buat migration baru di Supabase
4. **Edge Functions**: Deploy function baru via dashboard Supabase

## Support

Untuk pertanyaan atau bug report, hubungi tim pengembang.

---

Built with React, TypeScript, Tailwind CSS, and Supabase.
