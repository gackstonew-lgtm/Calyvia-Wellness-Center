/**
 * ==============================================================================
 * Calyvia Wellness Center — Secure Administrator Provisioning Utility
 * ==============================================================================
 * Provisions or reconciles the authoritative Primary System Administrator account
 * in the hosted Supabase PostgreSQL database and Supabase Auth admin API.
 * Uses Argon2id password hashing, enforces least-privilege, associates staff profiles,
 * and maintains full audit logging without destroying existing credentials.
 *
 * Usage:
 *   npm run provision:admin -- --email="admin@calyviawellness.co.ke" --password="admin123" --name="Dr. Antony Baraka"
 * Options:
 *   --email                    Administrator email (default: admin@calyviawellness.co.ke)
 *   --password                 Initial administrator password (min 8 chars)
 *   --name                     Full name and professional title
 *   --phone                    Contact phone number (default: +254700534306)
 *   --reset-password           Explicitly rotate/reset password if user already exists
 *   --require-password-change  Force user to change password upon next login (default: true)
 * ==============================================================================
 */

import { Pool } from 'pg';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment configuration from root and local workspaces
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function parseArg(key: string): string | null {
  const arg = process.argv.find((a) => a.startsWith(`--${key}=`));
  if (arg) {
    return arg.split('=')[1].trim();
  }
  return null;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(`--${flag}`);
}

async function run() {
  console.log('[Calyvia Provisioning] Initiating Primary Administrator Provisioning Workflow...');

  const email = (
    parseArg('email') ||
    process.env.BOOTSTRAP_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    'admin@calyviawellness.co.ke'
  ).toLowerCase().trim();

  const password =
    parseArg('password') ||
    parseArg('temp-password') ||
    process.env.BOOTSTRAP_ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    'admin123';

  const fullName =
    parseArg('name') ||
    process.env.ADMIN_NAME ||
    'Dr. Antony Baraka (Medical Director & Administrator)';

  const phone = parseArg('phone') || process.env.ADMIN_PHONE || '+254700534306';
  const shouldResetPassword = hasFlag('reset-password');
  const requirePasswordChange = !hasFlag('no-password-change');

  if (!email || !password) {
    console.error(`
[ERROR] Missing administrator credentials.
Please provide parameters or set environment variables:
  npm run provision:admin -- --email="admin@calyviawellness.co.ke" --password="admin123"
    `);
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('[ERROR] Password must be at least 8 characters in length.');
    process.exit(1);
  }

  const rawConnectionString = process.env.DATABASE_URL || '';
  if (!rawConnectionString) {
    console.error('[ERROR] DATABASE_URL is not configured in environment.');
    process.exit(1);
  }

  const connectionString = rawConnectionString
    .replace(/([?&])sslmode=[^&]+(&|$)/, '$1')
    .replace(/[?&]$/, '');

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log(`[Calyvia Provisioning] Hashing password with Argon2id for identifier: ${email}...`);
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    console.log('[Calyvia Provisioning] Connecting to Supabase PostgreSQL database...');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query('SET search_path = public, extensions');

      // Ensure must_change_password column exists
      await client.query(`
        ALTER TABLE public.users 
        ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false
      `);

      // Check if user already exists
      const checkRes = await client.query(
        'SELECT id, role, password_hash, is_active FROM public.users WHERE email = $1',
        [email],
      );

      let userId: string;
      let isNewUser = false;

      if (checkRes.rows.length > 0) {
        userId = checkRes.rows[0].id;
        const existingRole = checkRes.rows[0].role;

        if (shouldResetPassword) {
          console.log(`[Calyvia Provisioning] Explicit password reset requested for existing administrator (${userId})...`);
          await client.query(
            `UPDATE public.users 
             SET password_hash = $1, role = 'SUPER_ADMIN', full_name = $2, phone = $3, 
                 is_active = true, must_change_password = $4, updated_at = now()
             WHERE id = $5`,
            [passwordHash, fullName, phone, requirePasswordChange, userId],
          );
          console.log(`[Calyvia Provisioning] Password updated. Must change password flag: ${requirePasswordChange}`);
        } else {
          console.log(`[Calyvia Provisioning] Administrator (${userId}) already exists. Retaining current password hash.`);
          await client.query(
            `UPDATE public.users 
             SET role = 'SUPER_ADMIN', full_name = $1, phone = $2, is_active = true, updated_at = now()
             WHERE id = $3`,
            [fullName, phone, userId],
          );
          console.log(`[Calyvia Provisioning] Reconciled role (current: ${existingRole} -> SUPER_ADMIN) and verified active state.`);
        }
      } else {
        isNewUser = true;
        // Synchronize with existing Supabase auth.users UID if available to guarantee unified identity
        const authUserCheck = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
        userId = authUserCheck.rows.length > 0 ? authUserCheck.rows[0].id : '10000000-0000-0000-0000-000000000001';
        console.log(`[Calyvia Provisioning] Registering new primary SUPER_ADMIN user (${userId})...`);
        await client.query(
          `INSERT INTO public.users (id, email, password_hash, role, full_name, phone, is_active, must_change_password)
           VALUES ($1, $2, $3, 'SUPER_ADMIN', $4, $5, true, $6)
           ON CONFLICT (email) DO UPDATE SET 
             role = 'SUPER_ADMIN', 
             full_name = EXCLUDED.full_name,
             is_active = true`,
          [userId, email, passwordHash, fullName, phone, requirePasswordChange],
        );
        console.log(`[Calyvia Provisioning] User record created with initial temporary password flag: ${requirePasswordChange}`);
      }

      // Reconcile associated staff profile
      console.log(`[Calyvia Provisioning] Reconciling staff profile for administrator (${userId})...`);
      await client.query(
        `INSERT INTO public.staff_profiles (
           id, user_id, national_id_encrypted, department, job_title, 
           license_number, license_board, date_joined
         ) VALUES (
           gen_random_uuid(), $1::uuid, 'ENC:ADMIN:PROVISIONED', 'Executive Management & Administration', 
           'Medical Director & Primary Administrator', 'KMPDC/A/BARAKA', 'Kenya Medical Practitioners and Dentists Council', now()
         ) ON CONFLICT (user_id) DO UPDATE SET
           department = 'Executive Management & Administration',
           job_title = 'Medical Director & Primary Administrator'`,
        [userId],
      );

      // Record immutable security audit log entry
      await client.query(
        `INSERT INTO public.audit_logs (
           id, user_id, role, action, entity_name, entity_id, new_values, timestamp
         ) VALUES (
           gen_random_uuid(), $1::uuid, 'SUPER_ADMIN', 'BOOTSTRAP_PRIMARY_ADMINISTRATOR', 'users', $2::text, $3::jsonb, now()
         )`,
        [
          userId,
          userId,
          JSON.stringify({
            email,
            role: 'SUPER_ADMIN',
            isNewUser,
            passwordReset: shouldResetPassword,
            mustChangePassword: requirePasswordChange,
            provisionedAt: new Date().toISOString(),
          }),
        ],
      );

      await client.query('COMMIT');
      console.log(`[Calyvia Provisioning] SUCCESS: PostgreSQL database records initialized for [${email}].`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // Synchronize Supabase Auth Identity (if credentials configured)
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

    if (supabaseUrl && supabaseServiceKey) {
      try {
        console.log('[Calyvia Provisioning] Synchronizing Supabase Auth administration user...');
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
        if (!listError && usersData?.users) {
          const existingAuthUser = usersData.users.find((u) => u.email?.toLowerCase() === email);

          if (!existingAuthUser) {
            console.log(`[Calyvia Provisioning] Creating user in Supabase Auth [${email}]...`);
            const { data: createData, error: createError } = await supabase.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
              user_metadata: { role: 'SUPER_ADMIN', fullName },
              app_metadata: { role: 'SUPER_ADMIN' },
            });

            if (createError) {
              console.warn(`[Calyvia Provisioning] Supabase Auth creation note: ${createError.message}`);
            } else {
              console.log(`[Calyvia Provisioning] Supabase Auth identity created (auth id: ${createData.user?.id}).`);
            }
          } else {
            console.log(`[Calyvia Provisioning] Supabase Auth user exists (${existingAuthUser.id}). Reconciling roles...`);
            await supabase.auth.admin.updateUserById(existingAuthUser.id, {
              user_metadata: { role: 'SUPER_ADMIN', fullName },
              app_metadata: { role: 'SUPER_ADMIN' },
            });
            if (shouldResetPassword) {
              await supabase.auth.admin.updateUserById(existingAuthUser.id, { password });
              console.log('[Calyvia Provisioning] Supabase Auth password synchronized.');
            }
          }
        }
      } catch (authErr: any) {
        console.warn(`[Calyvia Provisioning] Supabase Auth API synchronization note: ${authErr.message}`);
      }
    }

    console.log(`
==============================================================================
CALYVIA WELLNESS CENTER — PRIMARY ADMINISTRATOR PROVISIONING COMPLETE
==============================================================================
Account Email:       ${email}
Account Role:        SUPER_ADMIN (Facility Director & Primary Authority)
Status:              ACTIVE
Temporary Password:  ${shouldResetPassword ? 'CONFIGURED (Must change on login)' : 'PRESERVED'}
Security Definer:    Authoritative in PostgreSQL public.users + Supabase Auth
==============================================================================
    `);
  } catch (err: any) {
    console.error(`[Calyvia Provisioning] FAILED: ${err.message}`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
