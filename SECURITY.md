# Security Configuration Guide

## Supabase Auth Settings

### Enable Password Breach Detection

To enhance password security and prevent compromised passwords, enable HaveIBeenPwned protection:

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click on **Authentication** → **Policies**

2. **Enable "Check password against HaveIBeenPwned"**
   - Toggle ON for password breach detection
   - This prevents users from using passwords that appear in known breaches

3. **Additional Settings**
   - Email Confirmations: Disabled (for development) or Enabled (for production)
   - Double-Confirm Email Changes: Enabled (recommended for production)

## Database Security

### Row Level Security (RLS)

All tables have RLS enabled with optimized policies:

- **user_profiles**: Users can only read/update their own profile, Admins can manage all
- **fixed_assets**: Read-only for authenticated users, write access for Admins only
- **consumable_assets**: Read-only for authenticated users, write access for Admins only
- **asset_transactions**: Users can only create transactions for themselves
- **locations**: Read-only for all authenticated users

### RLS Optimization

All RLS policies use the optimized subquery pattern:
```sql
-- Optimized pattern (better performance at scale)
USING (id = (select auth.uid()))

-- Instead of
USING (id = auth.uid())
```

This ensures auth functions are called once per query instead of once per row.

### Foreign Key Constraints

All foreign keys are properly indexed for optimal query performance:
- `asset_transactions.user_id` → `auth.users.id`
- `fixed_assets.location_id` → `locations.id`
- `consumable_assets.location_id` → `locations.id`

## Indexes

Strategic indexes for performance without bloat:

- `idx_user_profiles_role` (partial index on Admin role)
- `idx_asset_transactions_user_id_created` (composite for audit queries)

Removed unused indexes to:
- Reduce storage overhead
- Improve write performance
- Reduce maintenance burden

## Authentication Best Practices

### For Administrators

1. **Strong Passwords**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Avoid dictionary words or patterns

2. **Regular Password Updates**
   - Change passwords every 90 days
   - Immediately change if breach detected

3. **Secure Access**
   - Only login from trusted networks
   - Use HTTPS only (enforced by Supabase)
   - Clear browser cache after logout

### For End Users

1. **Account Security**
   - Never share login credentials
   - Use unique passwords across sites
   - Update password if suspicious activity detected

2. **Session Management**
   - Logout when finished
   - Don't login on shared computers
   - Clear browser history

## Data Protection

### Encryption

- **In Transit**: All data encrypted with TLS 1.2+
- **At Rest**: PostgreSQL encryption at storage level
- **Backups**: Encrypted and stored securely

### Audit Logging

All data modifications logged in `asset_transactions`:
- User ID
- Timestamp
- Transaction type (Add, Edit, Delete, Take, Report)
- Quantity changes
- Notes/description

### Backup & Recovery

- Automatic daily backups
- Point-in-time recovery available
- Geographic redundancy

## Compliance

### GDPR Compliance

- User data stored securely
- User can request data export
- Right to deletion implemented
- Privacy policy available

### Data Retention

- Active user data: Indefinite (unless deleted)
- Audit logs: 2 years minimum
- Session tokens: 24 hours (automatically expired)

## Regular Security Checks

### Monthly

- Review audit logs for suspicious activity
- Check user access patterns
- Verify RLS policies are active

### Quarterly

- Update dependencies
- Run security audits
- Review and rotate credentials
- Assess new security threats

### Annually

- Full security review
- Penetration testing (recommended)
- Compliance audit
- Policy updates

## Incident Response

### If Password is Compromised

1. **Immediately**
   - Reset password
   - Review recent activity in audit logs
   - Check all active sessions

2. **Notify Administrator**
   - Report suspicious activity
   - Provide timeline of events
   - Request forced logout of all sessions

3. **Follow-up**
   - Change all associated passwords
   - Enable 2FA (if available)
   - Monitor account for further issues

### If Unauthorized Access is Detected

1. **Immediate Actions**
   - Force logout from all sessions
   - Disable user account
   - Review audit logs

2. **Investigation**
   - Check transaction history
   - Identify affected data
   - Assess data compromise

3. **Recovery**
   - Restore from backup if necessary
   - Re-enable account with new password
   - Notify affected users

## Additional Resources

- [Supabase Security](https://supabase.com/docs/guides/auth/overview)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [HaveIBeenPwned](https://haveibeenpwned.com/)
- [OWASP Authentication](https://owasp.org/www-project-top-ten/)

---

Last Updated: 2024
Security Review: Complete
