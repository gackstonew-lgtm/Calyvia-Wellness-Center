# Calyvia Wellness Center — Disaster Recovery & Backup Runbook

## 1. Backup Strategy Overview
In compliance with the Kenya Data Protection Act 2019 and clinical record preservation guidelines:
- **Daily Full Backups:** Automated `pg_dump` of PostgreSQL database at 01:00 EAT.
- **Hourly WAL Archiving:** Point-in-time recovery (PITR) for continuous transaction state.
- **MinIO/S3 Document Mirroring:** Encrypted object sync for digital signatures and scans.
- **Off-Site Retention:** 30 daily snapshots, 12 monthly archives, minimum 10-year retention for medical records.

---

## 2. Automated PostgreSQL Backup Script

```bash
#!/usr/bin/env bash
# /scripts/backup-db.sh - Run via cron daily at 01:00 EAT
set -euo pipefail

BACKUP_DIR="/var/backups/calyvia/postgres"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/calyvia_backup_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting Calyvia database backup..."
docker exec calyvia_postgres pg_dump -U calyvia_user -d calyvia_db --clean --if-exists | gzip > "${BACKUP_FILE}"

echo "[$(date)] Backup completed successfully: ${BACKUP_FILE}"

# Enforce 30-day retention
find "${BACKUP_DIR}" -type f -name "calyvia_backup_*.sql.gz" -mtime +30 -delete
```

---

## 3. Database Restoration Procedure

```bash
#!/usr/bin/env bash
# /scripts/restore-db.sh <path-to-backup-file.sql.gz>
set -euo pipefail

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file ${BACKUP_FILE} not found."
  exit 1
fi

echo "[$(date)] Restoring Calyvia database from ${BACKUP_FILE}..."

gunzip -c "${BACKUP_FILE}" | docker exec -i calyvia_postgres psql -U calyvia_user -d calyvia_db

echo "[$(date)] Database restoration finished. Verifying record integrity..."
docker exec calyvia_postgres psql -U calyvia_user -d calyvia_db -c "SELECT COUNT(*) FROM patients; SELECT COUNT(*) FROM audit_logs;"
```

---

## 4. Master Encryption Key (`ENCRYPTION_MASTER_KEY`) Safeguards
- The master AES-256-GCM encryption key must **never** be stored in git or inside standard database backups.
- Store the production key in an encrypted Hardware Security Module (HSM) or Secret Manager (e.g. AWS Secrets Manager, HashiCorp Vault).
- Without this key, all clinical SOAP notes and national IDs in restored database dumps remain ciphertext.
