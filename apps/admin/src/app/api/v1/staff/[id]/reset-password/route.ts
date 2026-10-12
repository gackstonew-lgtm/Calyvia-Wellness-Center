import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as argon2 from 'argon2';

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
    const { newPassword, mustChangePassword = true } = body;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { message: 'New provisioned password must be at least 8 characters in length.' },
        { status: 400 }
      );
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

    if (admin.role === 'FACILITY_ADMIN' && targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Facility Administrators cannot reset credentials for Primary System Administrators.' },
        { status: 403 }
      );
    }

    // 1. Update password in Supabase Auth
    try {
      await supabase.auth.admin.updateUserById(targetUserId, { password: newPassword });
    } catch (authErr: any) {
      console.warn('Supabase Auth reset warning:', authErr?.message);
    }

    // 2. Hash password with Argon2id for database record
    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const { error: dbError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        must_change_password: mustChangePassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUserId);

    if (dbError) {
      return NextResponse.json({ message: dbError.message }, { status: 400 });
    }

    // 3. Audit log
    await supabase.from('audit_logs').insert({
      user_id: admin.id || null,
      role: admin.role || 'SUPER_ADMIN',
      action: 'STAFF_PASSWORD_RESET',
      entity_name: 'users',
      entity_id: targetUserId,
      new_values: { mustChangePassword, resetBy: admin.id },
    });

    return NextResponse.json({
      success: true,
      message: `Password reset successfully for ${targetUser.email}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || 'Error resetting password' }, { status: 500 });
  }
}
