/**
 * ==============================================================================
 * Calyvia Wellness Center — Secure Administrator Provisioning Utility
 * ==============================================================================
 * Provisions or updates an authorized System Administrator account in the hosted
 * Supabase database with Argon2id password hashing and staff profile association.
 *
 * Usage:
 *   npx ts-node src/database/provision-admin.ts --email=admin@calyviawellness.co.ke --password="YourSecurePassword#2026" --name="Dr. Antony Baraka"
 * Or configure BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD in .env
 * ==============================================================================
 */

import { Pool } from 'pg';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment configuration
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function parseArg(key: string): string | null {
  const arg = process.argv.find((a) => a.startsWith(`--${key}=`));
  if (arg) {
    return arg.split('=')[1].trim();
  }
  return null;
}

async function run() {
  console.log('[Calyvia Provisioning] Initiating administrator provisioning...');

  const email = parseArg('email') || process.env.BOOTSTRAP_ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  const password = parseArg('password') || process.env.BOOTSTRAP_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
  const fullName = parseArg('name') || process.env.ADMIN_NAME || 'Dr. Antony Baraka (Medical Director & Administrator)';
  const phone = parseArg('phone') || process.env.ADMIN_PHONE || '+254700534306';

  if (!email || !password) {
    console.error(`
[ERROR] Missing administrator credentials.
Please provide parameters or set environment variables:
  npx ts-node src/database/provision-admin.ts --email="admin@calyviawellness.co.ke" --password="ClinicalSecure#2026" --name="Dr. Antony Baraka"
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
    console.log(`[Calyvia Provisioning] Generating Argon2id hash for ${email}...`);
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

      // Check if user already exists
      const checkRes = await client.query('SELECT id, role FROM public.users WHERE email = $1', [email.toLowerCase()]);

      let userId: string;
      if (checkRes.rows.length > 0) {
        userId = checkRes.rows[0].id;
        console.log(`[Calyvia Provisioning] Updating existing user (${userId}) to SUPER_ADMIN...`);
        await client.query(
          `UPDATE public.users 
           SET password_hash = $1, role = 'SUPER_ADMIN', full_name = $2, phone = $3, is_active = true, updated_at = now()
           WHERE id = $4`,
          [passwordHash, fullName, phone, userId],
        );
      } else {
        userId = '10000000-0000-0000-0000-000000000001';
        console.log(`[Calyvia Provisioning] Creating new SUPER_ADMIN user (${userId})...`);
        await client.query(
          `INSERT INTO public.users (id, email, password_hash, role, full_name, phone, is_active)
           VALUES ($1, $2, $3, 'SUPER_ADMIN', $4, $5, true)
           ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'SUPER_ADMIN'`,
          [userId, email.toLowerCase(), passwordHash, fullName, phone],
        );
      }

      // Ensure staff profile exists
      await client.query(
        `INSERT INTO public.staff_profiles (id, user_id, national_id_encrypted, department, job_title, date_joined)
         VALUES (gen_random_uuid(), $1, 'ENC:ADMIN:PROVISIONED', 'Executive Management & Administration', 'Medical Director & Administrator', now())
         ON CONFLICT (user_id) DO NOTHING`,
        [userId],
      );

      // Record audit log
      await client.query(
        `INSERT INTO public.audit_logs (id, user_id, role, action, entity_name, entity_id, old_values, new_values, timestamp)
         VALUES (gen_random_uuid(), $1, 'SUPER_ADMIN', 'PROVISION_ADMIN_ACCOUNT', 'users', $1, NULL, $2, now())`,
        [userId, JSON.stringify({ email: email.toLowerCase(), role: 'SUPER_ADMIN', provisionedAt: new Date().toISOString() })],
      );

      await client.query('COMMIT');
      console.log(`[Calyvia Provisioning] SUCCESS: Administrator account [${email}] provisioned with SUPER_ADMIN privileges.`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error(`[Calyvia Provisioning] FAILED: ${err.message}`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
