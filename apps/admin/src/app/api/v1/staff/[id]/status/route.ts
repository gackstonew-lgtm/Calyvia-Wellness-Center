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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const authCheck = await verifyAdminCaller(authHeader);

    if (!authCheck.authorized) {
      return NextResponse.json({ message: authCheck.error || 'Unauthorized' }, { status: 403 });
    }

    const admin = authCheck.user;
    const targetUserId = params.id;
    const body = await req.json();
    const { status, reason } = body;

    if (!status || !['ACTIVE', 'SUSPENDED', 'DEACTIVATED'].includes(status)) {
      return NextResponse.json({ message: 'Valid status is required.' }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || '');

    const { data: targetUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', targetUserId)
      .single();

    if (!targetUser) {
      return NextResponse.json({ message: 'Staff account not found.' }, { status: 404 });
    }

    if (targetUserId === admin.id && status !== 'ACTIVE') {
      return NextResponse.json({ message: 'You cannot suspend your own active administrator account.' }, { status: 400 });
    }

    if (admin.role === 'FACILITY_ADMIN' && targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Facility Administrators cannot suspend Primary System Administrators.' },
        { status: 403 }
      );
    }

    const isActive = status === 'ACTIVE';
    const approvalStatus = isActive ? 'APPROVED' : status;

    const { error: dbError } = await supabase
      .from('users')
      .update({
        is_active: isActive,
        approval_status: approvalStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUserId);

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 400 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: admin.id || null,
      role: admin.role || 'SUPER_ADMIN',
      action: 'STAFF_STATUS_UPDATED',
      entity_name: 'users',
      entity_id: targetUserId,
      new_values: { status, reason, updatedBy: admin.id },
    });

    return NextResponse.json({
      success: true,
      message: `Account status updated to ${status} for ${targetUser.email}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error updating status' }, { status: 500 });
  }
}
