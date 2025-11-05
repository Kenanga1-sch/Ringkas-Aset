# Ringkas Aset - Quick Start Guide

## Start Development

```bash
npm install    # Install dependencies
npm run dev    # Start at http://localhost:5173
npm run build  # Build for production
```

## First Login

1. **Create Account**
   - Go to http://localhost:5173
   - Click "Belum punya akun? Daftar"
   - Select Role: "Admin"
   - Register with your email

2. **First Admin Tasks**
   - Add Locations (Dashboard → Kelola Ruangan)
   - Add Sample Assets (Dashboard → Tambah Barang)
   - Invite other users

## User Roles

| Role | Can Do |
|------|--------|
| **Admin** | Add/edit/delete all assets, manage locations, view reports |
| **Guru** | View assets, report damage, take stock |
| **Penjaga Sekolah** | View assets, report damage, take stock |

## Common Tasks

### Add Fixed Asset (Laptop, Kursi, AC, dll)
1. Dashboard → Tambah Barang → Aset Tetap
2. Fill: Name, Code, Location, Date, Price
3. Click Simpan

### Add Consumable Item (Kertas, Spidol, dll)
1. Dashboard → Tambah Barang → Barang Habis Pakai
2. Fill: Name, Code, Location, Unit, Quantity
3. Click Simpan

### Take Stock
1. Dashboard → Ambil Stok
2. Select item
3. Enter quantity
4. Click Simpan

### Report Damage
1. Dashboard → Lapor Rusak
2. Select asset
3. Choose damage level (Ringan/Berat)
4. Add description
5. Click Simpan

### Generate Report
1. Menu → Laporan
2. Filter by date (optional)
3. Click "Cetak Laporan PDF"

## Important Security Settings

### ⚠️ Enable Password Protection (Admin)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Your Project → Authentication → Policies
3. Toggle: "Check password against HaveIBeenPwned" → ON

### Backup Your Data
- Automatic daily backups in Supabase
- Can restore from any point in time
- Contact support for manual backups

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't login | Clear browser cookies, check email/password |
| No data showing | Refresh page, check location filter |
| Slow performance | Clear cache, restart browser |
| Build error | `npm install` then `npm run build` |

## Key Files

- `src/App.tsx` - Main application
- `src/components/` - UI components
- `src/services/` - Database & API
- `README.md` - Full documentation
- `SECURITY.md` - Security details
- `SETUP_INSTRUCTIONS.md` - Installation guide

## Database Migrations

All applied automatically. Current status:

```
✅ create_initial_schema (Schema & RLS)
✅ setup_storage_buckets (File storage)
✅ seed_initial_data (Initial locations)
✅ fix_security_issues (Performance & security)
```

## API Endpoints (Internal)

```
POST /functions/v1/gemini-assistant
  Body: { query: string, inventoryData: [] }
  Response: { response: string }
```

## Environment Variables (.env)

```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

Already configured - no changes needed for development!

## Deployment Checklist

Before deploying to production:

- [ ] Enable password breach detection
- [ ] Set strong CORS policy
- [ ] Backup database
- [ ] Test all user roles
- [ ] Configure storage bucket
- [ ] Set Gemini API key (optional)
- [ ] Update environment variables
- [ ] Test PDF export
- [ ] Verify HTTPS enabled

## Common SQL Queries

### View All Assets
```sql
SELECT name, code, status, price FROM fixed_assets;
```

### View Transactions Log
```sql
SELECT * FROM asset_transactions
  ORDER BY created_at DESC LIMIT 50;
```

### Check User Profiles
```sql
SELECT name, role, created_at FROM user_profiles;
```

### Export Report
```sql
SELECT
  name, code, status, price, purchase_date
FROM fixed_assets
WHERE purchase_date >= '2024-01-01'
ORDER BY purchase_date DESC;
```

## Support

- 📖 Full Docs: [README.md](./README.md)
- 🔒 Security: [SECURITY.md](./SECURITY.md)
- ⚙️ Setup: [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
- 🐛 Issues: Check browser console (F12 → Console)

---

**Ready to use!** Start with `npm run dev`
