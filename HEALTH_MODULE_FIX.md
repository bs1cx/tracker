# Health Module 500 Error Fix - Complete Guide

## Problem
Getting `500 Internal Server Error` when submitting health data (especially heart rate logs) in production.

## Root Causes
1. **Missing Database Tables**: Health tables may not exist in Supabase
2. **Missing RLS Policies**: Row Level Security policies not configured
3. **Unhandled Errors**: Server actions throwing unhandled exceptions
4. **Type Mismatches**: Input validation issues

## Solution

### Step 1: Run SQL Migration (CRITICAL)

**File**: `supabase-fix-health-tables-rls.sql`

**Instructions**:
1. Open Supabase Dashboard → SQL Editor
2. Copy **ONLY the SQL content** from `supabase-fix-health-tables-rls.sql`
3. Paste into SQL Editor
4. Click "Run"

**⚠️ IMPORTANT**: Do NOT copy "use server" or "use client" lines. Only SQL code!

**What it does**:
- Creates `health_metrics` table (if not exists)
- Creates `sleep_logs` table (if not exists)
- Creates `water_intake` table (if not exists)
- Creates `nutrition_logs` table (if not exists)
- Enables Row Level Security (RLS)
- Creates RLS policies for SELECT, INSERT, UPDATE, DELETE
- Creates indexes for performance

### Step 2: Server Actions Fixed

**File**: `app/actions-health.ts`

**Changes**:
- ✅ Added Zod validation schemas
- ✅ Wrapped all operations in try/catch
- ✅ Return structured error objects: `{ success: false, error: "message" }`
- ✅ Specific error messages for:
  - Missing tables (42P01)
  - RLS policy violations (42501)
  - Validation errors
  - Auth errors
- ✅ Detailed error logging

**Functions Updated**:
- `addHeartRateLog` ✅
- `addWaterLog` ✅
- `addSleepLog` ✅
- `addNutritionLog` ✅

### Step 3: Client-Side Error Handling

**Files Updated**:
- `components/health/heart-rate-form.tsx` ✅
- `components/health/water-form.tsx` ✅
- `components/health/sleep-form.tsx` ✅
- `components/health/nutrition-form.tsx` ✅

**Changes**:
- ✅ Display specific error messages from server
- ✅ Client-side validation before submission
- ✅ Better error messages for users

## Error Response Format

All server actions now return:
```typescript
// Success
{ success: true }

// Error
{ 
  success: false, 
  error: "Specific error message here" 
}
```

## Common Error Messages

### "Veritabanı tablosu bulunamadı"
**Solution**: Run `supabase-fix-health-tables-rls.sql` in Supabase SQL Editor

### "İzin hatası. RLS politikaları kontrol edilmeli"
**Solution**: RLS policies are missing. The SQL script includes them.

### "Kimlik doğrulama hatası"
**Solution**: User session expired. User needs to log in again.

### "Geçersiz veri: ..."
**Solution**: Input validation failed. Check the form values.

## Testing

1. **Run SQL Migration**: Execute `supabase-fix-health-tables-rls.sql`
2. **Test Heart Rate**: Try adding a heart rate log
3. **Check Console**: Look for any error messages
4. **Verify Data**: Check Supabase table to confirm data was inserted

## Verification Checklist

- [ ] SQL migration script executed successfully
- [ ] Tables exist in Supabase (health_metrics, sleep_logs, water_intake, nutrition_logs)
- [ ] RLS is enabled on all tables
- [ ] RLS policies exist for all operations
- [ ] Server actions return error objects (not throwing)
- [ ] Client forms display error messages
- [ ] No 500 errors in production

## Next Steps

If errors persist:
1. Check Supabase logs for detailed error messages
2. Verify RLS policies are active
3. Check user authentication status
4. Review browser console for client-side errors

