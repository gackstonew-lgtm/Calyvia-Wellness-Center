import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ylpmrplszdxtlmzzrfgz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY || '';
if (!SUPABASE_SERVICE_ROLE_KEY) console.warn('SUPABASE_SERVICE_ROLE_KEY is not defined in environment');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.calyviawellness.co.ke/api/v1';

async function verifyAdminCaller(authHeader: string | null): Promise<{ authorized: boolean; user?: any; error?: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Authorization header is required.' };
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const meRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (meRes.ok) {
      const meData = await meRes.json();
      const user = meData.user;
      if (user && (user.role === 'SUPER_ADMIN' || user.role === 'FACILITY_ADMIN')) {
        return { authorized: true, user };
      }
      return { authorized: false, error: 'Insufficient permissions. Facility Administrator role required.' };
    }
  } catch (err: any) {}

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || '');
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return { authorized: false, error: 'Invalid or expired administrative credentials.' };
    }

    const { data: dbUser } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active')
      .eq('id', authData.user.id)
      .single();

    if (dbUser && (dbUser.role === 'SUPER_ADMIN' || dbUser.role === 'FACILITY_ADMIN')) {
      return { authorized: true, user: dbUser };
    }

    return { authorized: false, error: 'Insufficient permissions. Facility Administrator role required.' };
  } catch (err: any) {
    return { authorized: false, error: 'Failed to verify administrative authorization.' };
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const authCheck = await verifyAdminCaller(authHeader);

    if (!authCheck.authorized) {
      return NextResponse.json({ message: authCheck.error || 'Unauthorized' }, { status: 403 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || '');
    const url = new URL(req.url);
    const search = url.searchParams.get('search');
    const department = url.searchParams.get('department');
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');

    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        is_active,
        approval_status,
        phone,
        must_change_password,
        created_at,
        updated_at,
        staff_profiles (
          department,
          job_title,
          license_number,
          license_board,
          license_expiry_date
        )
      `)
      .order('created_at', { ascending: false });

    if (role && role !== 'ALL') query = query.eq('role', role);
    if (status && status !== 'ALL') {
      if (status === 'ACTIVE') query = query.eq('is_active', true);
      else if (status === 'SUSPENDED') query = query.eq('is_active', false);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    let results = (data || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      role: u.role,
      phone: u.phone,
      isActive: u.is_active,
      approvalStatus: u.approval_status,
      mustChangePassword: u.must_change_password,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
      staffProfile: u.staff_profiles
        ? {
            department: u.staff_profiles.department,
            jobTitle: u.staff_profiles.job_title,
            licenseNumber: u.staff_profiles.license_number,
            licenseBoard: u.staff_profiles.license_board,
            licenseExpiryDate: u.staff_profiles.license_expiry_date,
          }
        : null,
    }));

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      results = results.filter((s: any) =>
        s.fullName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.staffProfile?.jobTitle?.toLowerCase().includes(q) ||
        s.staffProfile?.department?.toLowerCase().includes(q)
      );
    }

    if (department && department !== 'ALL') {
      results = results.filter((s: any) => s.staffProfile?.department === department);
    }

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error fetching staff' }, { status: 500 });
  }
}
