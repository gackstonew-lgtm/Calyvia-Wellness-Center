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

  // 1. Verify against the live NestJS backend /auth/me
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
  } catch (err: any) {
    // If backend /auth/me fails, continue to Supabase token verification
  }

  // 2. Fallback: Verify via Supabase Auth
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

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const authCheck = await verifyAdminCaller(authHeader);

    if (!authCheck.authorized) {
      return NextResponse.json(
        { message: authCheck.error || 'Unauthorized access.' },
        { status: 403 }
      );
    }

    const admin = authCheck.user;
    const body = await req.json();

    const {
      fullName,
      email,
      phone,
      department,
      jobTitle,
      role = 'NURSE',
      initialPassword,
      status = 'ACTIVE',
      mustChangePassword = true,
      licenseNumber,
      licenseBoard,
      licenseExpiryDate,
    } = body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!fullName?.trim() || !normalizedEmail || !jobTitle?.trim()) {
      return NextResponse.json(
        { message: 'Full name, institutional email, and job title are required.' },
        { status: 400 }
      );
    }

    if (!initialPassword || initialPassword.length < 8) {
      return NextResponse.json(
        { message: 'Initial temporary password must be at least 8 characters in length.' },
        { status: 400 }
      );
    }

    if (admin.role === 'FACILITY_ADMIN' && role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Facility Administrators cannot create Primary System Administrator (SUPER_ADMIN) accounts.' },
        { status: 403 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || '');

    // Check for duplicate in public.users
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { message: `An institutional account with email '${normalizedEmail}' already exists.` },
        { status: 400 }
      );
    }

    // 1. Create user in Supabase Auth via Admin API
    let authUserId: string | null = null;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: initialPassword,
      email_confirm: true,
      user_metadata: {
        role,
        fullName: fullName.trim(),
        department,
      },
      app_metadata: {
        role,
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { message: `An authentication identity with email '${normalizedEmail}' already exists in Supabase Auth.` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: `Supabase Auth provisioning failed: ${authError.message}` },
        { status: 400 }
      );
    }

    authUserId = authData.user.id;

    // 2. Hash password with Argon2id for institutional database record
    const passwordHash = await argon2.hash(initialPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const isActive = status === 'ACTIVE';

    // 3. Insert into public.users
    const { error: userInsertError } = await supabase
      .from('users')
      .insert({
        id: authUserId,
        email: normalizedEmail,
        password_hash: passwordHash,
        role,
        full_name: fullName.trim(),
        phone: phone?.trim() || null,
        is_active: isActive,
        approval_status: isActive ? 'APPROVED' : 'SUSPENDED',
        must_change_password: mustChangePassword,
        approved_by: admin.id || null,
        approved_at: new Date().toISOString(),
      });

    if (userInsertError) {
      // Rollback auth user
      if (authUserId) {
        await supabase.auth.admin.deleteUser(authUserId);
      }
      return NextResponse.json(
        { message: `Failed to create public user record: ${userInsertError.message}` },
        { status: 400 }
      );
    }

    // 4. Insert into public.staff_profiles
    const { error: profileError } = await supabase
      .from('staff_profiles')
      .insert({
        user_id: authUserId,
        department: department || 'Clinical Operations',
        job_title: jobTitle.trim(),
        national_id_encrypted: 'ENC:ADMIN_PROVISIONED',
        license_number: licenseNumber?.trim() || null,
        license_board: licenseBoard?.trim() || null,
        license_expiry_date: licenseExpiryDate ? new Date(licenseExpiryDate).toISOString() : null,
        date_joined: new Date().toISOString(),
      });

    if (profileError) {
      console.warn('Profile creation notice:', profileError.message);
    }

    // 5. Insert audit log
    await supabase.from('audit_logs').insert({
      user_id: admin.id || null,
      role: admin.role || 'SUPER_ADMIN',
      action: 'STAFF_ACCOUNT_CREATED',
      entity_name: 'users',
      entity_id: authUserId,
      new_values: {
        targetEmail: normalizedEmail,
        assignedRole: role,
        department,
        jobTitle,
        status,
        mustChangePassword,
        createdBy: admin.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Institutional staff account provisioned successfully for ${fullName.trim()} (${normalizedEmail}).`,
        userId: authUserId,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: `Account provisioning error: ${err?.message || 'Internal Server Error'}` },
      { status: 500 }
    );
  }
}
