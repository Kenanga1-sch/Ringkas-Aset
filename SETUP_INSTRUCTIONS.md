# Ringkas Aset - Complete Setup Instructions

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Supabase account (free tier available at supabase.com)
- Modern web browser

## Installation Steps

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

The `.env` file already contains your Supabase credentials. Database migrations have been automatically applied.

**Verify in Supabase Dashboard:**
- Go to https://supabase.com/dashboard
- Select your project
- Navigate to SQL Editor
- Confirm tables exist: `locations`, `user_profiles`, `fixed_assets`, `consumable_assets`, `asset_transactions`

### 3. Enable Password Breach Detection (Security)

**Manual Setup:**

1. Go to Supabase Dashboard → Your Project
2. Navigate to **Authentication** → **Policies**
3. Find "Password Strength Check"
4. Toggle **"Check password against HaveIBeenPwned"** to ON
5. (Optional) Set "Minimum Password Length" to 8-12 characters

**What This Does:**
- Prevents users from creating accounts with compromised passwords
- Checks against breached password database
- Enhances security without affecting user experience

### 4. Configure Storage Bucket (For Asset Photos - Optional)

To enable photo uploads for assets:

1. Go to Supabase Dashboard → Your Project
2. Navigate to **Storage**
3. Click "Create new bucket"
4. Name: `asset-photos`
5. Choose "Public" access (for viewing)
6. Click "Create Bucket"

**Add Policies (Optional):**
```sql
-- Public read access
CREATE POLICY "Public can read asset photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'asset-photos');

-- Authenticated users can upload
CREATE POLICY "Authenticated can upload asset photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'asset-photos');
```

### 5. Configure Gemini AI (Optional)

To enable AI-powered inventory assistant:

1. Get Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Go to Supabase Dashboard → Your Project
3. Navigate to **Edge Functions** → `gemini-assistant`
4. Click "Secrets" or go to **Settings** → **Secrets**
5. Add secret: `GEMINI_API_KEY` = your-api-key-here
6. Redeploy edge function

### 6. Start Development Server

```bash
npm run dev
```

Application will run at `http://localhost:5173`

## First Time Usage

### Create First Admin Account

1. Open `http://localhost:5173`
2. Click "Belum punya akun? Daftar" (Don't have account? Sign up)
3. Fill in:
   - **Nama Lengkap**: Your name
   - **Email**: admin@sekolah.local (or any email)
   - **Peran**: Select "Admin"
   - **Password**: Strong password (8+ characters)
4. Click "Daftar" (Register)
5. You are now logged in as Admin

### Grant Admin Role (If Needed)

If you registered but need admin access later:

1. Go to Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run:
   ```sql
   UPDATE user_profiles
   SET role = 'Admin'
   WHERE id = 'your-user-id';
   ```

### Add Locations

1. Go to Inventaris (Inventory)
2. Click "Kelola Ruangan" (Manage Locations) - Admin only
3. Add locations:
   - Ruang Guru (Teacher's Room)
   - Perpustakaan (Library)
   - Kelas 10A, 10B, etc. (Classrooms)
   - Gudang ATK (Supply Storage)

### Add Sample Assets (Optional)

1. Go to Dashboard
2. Click "Tambah Barang" (Add Item)
3. Choose type: "Aset Tetap" (Fixed Asset)
4. Fill in:
   - Name: "Laptop ASUS"
   - Code: "LP-001"
   - Location: "Ruang Guru"
   - Purchase Date: Today's date
   - Price: 12000000
   - Status: "Baik"
5. Click "Simpan" (Save)

Repeat for consumable items (Barang Habis Pakai):
- Kertas A4, Spidol, Tinta Printer, etc.

## Production Deployment

### Build for Production

```bash
npm run build
npm run preview
```

### Deploy Options

#### Option 1: Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

#### Option 2: Netlify

1. Create account at netlify.com
2. Connect your Git repository
3. Build command: `npm run build`
4. Publish directory: `dist`

#### Option 3: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

```bash
docker build -t ringkas-aset .
docker run -p 3000:3000 ringkas-aset
```

## Environment Variables

### Development (.env)

Already configured with:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Anonymous key for client

### Production

Same variables needed. Set in your hosting platform:
- Vercel: Settings → Environment Variables
- Netlify: Settings → Build & Deploy → Environment
- Docker: Use `docker run -e VITE_SUPABASE_URL=... `

## Troubleshooting

### Login Issues

**"Invalid credentials"**
- Check email spelling
- Verify password (case-sensitive)
- Clear browser cookies
- Try incognito mode

**"Invalid JSON from the server"**
- Check internet connection
- Verify `.env` variables
- Check Supabase project is running

### Database Connection Issues

**"Failed to connect to database"**
- Verify `.env` file has correct credentials
- Check Supabase project is active
- Check network/firewall
- Restart development server

### Performance Issues

**"App is slow"**
- Check browser console for errors
- Clear cache: Ctrl+Shift+Del (or Cmd+Shift+Del)
- Restart dev server: Ctrl+C then `npm run dev`
- Check Supabase project isn't overloaded

### Build Errors

**"Cannot find module"**
- Run `npm install` again
- Delete `node_modules` and `npm install`
- Clear cache: `npm cache clean --force`

**"Build failed"**
- Check TypeScript errors: `npm run build` again
- Verify all imports are correct
- Check for circular dependencies

## Performance Optimization

### Queries are Slow

1. **Check RLS Policies**
   - Navigate to SQL Editor
   - Run: `EXPLAIN ANALYZE SELECT * FROM fixed_assets;`
   - Look for sequential scans

2. **Add Indexes**
   ```sql
   -- Create index on frequently filtered column
   CREATE INDEX idx_assets_status ON fixed_assets(status);
   ```

### Application is Slow

1. **Check Network Tab** (DevTools → Network)
2. **Reduce bundle size**
   ```bash
   npm run build
   # Check dist folder size
   ```
3. **Enable Production Mode**
   - React.StrictMode is development only
   - Production build automatically optimizes

## Security Checklist

- [ ] Enable Password Breach Detection (see section 3)
- [ ] Enable HTTPS (automatic on hosting platforms)
- [ ] Set strong CORS policy
- [ ] Regular backup testing
- [ ] Audit log monitoring
- [ ] User access reviews
- [ ] Keep dependencies updated: `npm update`
- [ ] Enable 2FA for Supabase dashboard

## Regular Maintenance

### Weekly
- Check audit logs for suspicious activity
- Verify backups completed

### Monthly
- Update npm dependencies
- Review user access
- Check storage usage

### Quarterly
- Full security audit
- Test disaster recovery
- Update documentation

## Support & Documentation

- [README.md](./README.md) - Feature overview
- [SECURITY.md](./SECURITY.md) - Security details
- [Supabase Docs](https://supabase.com/docs)
- [React Documentation](https://react.dev)

---

**Setup Complete!** Your Ringkas Aset application is ready to use.

For issues, refer to SECURITY.md and troubleshooting section above.
