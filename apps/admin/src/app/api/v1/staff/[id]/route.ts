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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const authCheck = await verifyAdminCaller(authHeader);

    if (!authCheck.authorized) {
      return NextResponse.json({ message: authCheck.error || 'Unauthorized' }, { status: 403 });
    }

    const admin = authCheck.user;
    const targetUserId = params.id;
    const body = await req.json();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || '');

    const { data: targetUser } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', targetUserId)
      .single();

    if (!targetUser) {
      return NextResponse.json({ message: 'Staff account not found.' }, { status: 404 });
    }

    if (admin.role === 'FACILITY_ADMIN') {
      if (targetUser.role === 'SUPER_ADMIN' || body.role === 'SUPER_ADMIN') {
        return NextResponse.json(
          { message: 'Facility Administrators cannot modify Primary System Administrator (SUPER_ADMIN) accounts.' },
          { status: 403 }
        );
      }
    }

    if (targetUserId === admin.id && body.role && body.role !== targetUser.role) {
      return NextResponse.json({ message: 'Administrators cannot modify their own assigned role.' }, { status: 403 });
    }

    const userUpdates: any = { updated_at: new Date().toISOString() };
    if (body.fullName) userUpdates.full_name = body.fullName.trim();
    if (body.phone !== undefined) userUpdates.phone = body.phone?.trim() || null;
    if (body.role) userUpdates.role = body.role;
    if (body.status) {
      userUpdates.is_active = body.status === 'ACTIVE';
      userUpdates.approval_status = body.status === 'ACTIVE' ? 'APPROVED' : body.status;
    }

    const { error: userError } = await supabase
      .from('users')
      .update(userUpdates)
      .eq('id', targetUserId);

    if (userError) {
      return NextResponse.json({ message: userError.message }, { status: 400 });
    }

    // Check staff_profiles
    const profileUpdates: any = {};
    if (body.department) profileUpdates.department = body.department;
    if (body.jobTitle) profileUpdates.job_title = body.jobTitle;
    if (body.licenseNumber !== undefined) profileUpdates.license_number = body.licenseNumber;
    if (body.licenseBoard !== undefined) profileUpdates.license_board = body.licenseBoard;
    if (body.licenseExpiryDate !== undefined) {
      profileUpdates.license_expiry_date = body.licenseExpiryDate ? new Date(body.licenseExpiryDate).toISOString() : null;
    }

    if (Object.keys(profileUpdates).length > 0) {
      const { data: profile } = await supabase
        .from('staff_profiles')
        .select('id')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (profile) {
        await supabase
          .from('staff_profiles')
          .update(profileUpdates)
          .eq('user_id', targetUserId);
      } else {
        await supabase.from('staff_profiles').insert({
          user_id: targetUserId,
          department: body.department || 'Clinical Operations',
          job_title: body.jobTitle || 'Clinical Staff',
          national_id_encrypted: 'ENC:ADMIN_PROVISIONED',
          ...profileUpdates,
        });
      }
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: admin.id || null,
      role: admin.role || 'SUPER_ADMIN',
      action: 'STAFF_ACCOUNT_UPDATED',
      entity_name: 'users',
      entity_id: targetUserId,
      new_values: body,
    });

    return NextResponse.json({
      success: true,
      message: `Account details for ${body.fullName || targetUser.email} updated successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error updating staff account' }, { status: 500 });
  }
}
