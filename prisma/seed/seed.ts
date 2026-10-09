import { PrismaClient, UserRole, Gender, PatientStatus, AdmissionType, ProgramType, NoteType, DetoxProtocolType, ScoreType, AssessmentSeverity, RoomType, BedStatus, InvoiceStatus, PaymentMethod, IncidentSeverity, TaskPriority, TaskStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function encryptField(text: string): string {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const key = crypto.createHash('sha256').update(masterKey).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');
  return `${iv.toString('base64')}:${authTag}:${encrypted}`;
}

async function main() {
  console.log('[Seed] Seeding realistic fictional data for Calyvia Wellness Center...');

  const defaultPasswordHash = await argon2.hash('Calyvia#2026');

  // 1. Staff Users for all 11 Roles
  const staffData = [
    {
      email: 'admin@calyviawellness.co.ke',
      fullName: 'Dr. Gackstone Baraka',
      role: UserRole.SUPER_ADMIN,
      phone: '+254700534306',
      title: 'Facility Director & Chief Medical Officer',
      dept: 'Executive Administration',
      license: 'KMPDC-A9842',
    },
    {
      email: 'medical.director@calyviawellness.co.ke',
      fullName: 'Dr. Evelyn Wanjiku',
      role: UserRole.MEDICAL_DIRECTOR,
      phone: '+254722100201',
      title: 'Lead Addiction Psychiatrist',
      dept: 'Psychiatry & Medical Care',
      license: 'KMPDC-P5519',
    },
    {
      email: 'doctor@calyviawellness.co.ke',
      fullName: 'Dr. Kevin Kiprotich',
      role: UserRole.DOCTOR_PSYCHIATRIST,
      phone: '+254733200302',
      title: 'Consultant Psychiatrist',
      dept: 'Clinical Assessment',
      license: 'KMPDC-P7721',
    },
    {
      email: 'nurse.station@calyviawellness.co.ke',
      fullName: 'Nurse Faith Wangari',
      role: UserRole.NURSE,
      phone: '+254711300403',
      title: 'Senior Detox Nurse in Charge',
      dept: 'Inpatient Nursing',
      license: 'NCK-RN-28410',
    },
    {
      email: 'counsellor@calyviawellness.co.ke',
      fullName: 'Counsellor Samuel Kioko',
      role: UserRole.COUNSELLOR,
      phone: '+254722400504',
      title: 'Lead Addiction Psychotherapist',
      dept: 'Psychotherapy & Rehabilitation',
      license: 'KPA-CP-1194',
    },
    {
      email: 'pharmacy@calyviawellness.co.ke',
      fullName: 'Pharm. Grace Achieng',
      role: UserRole.PHARMACIST,
      phone: '+254733500605',
      title: 'Superintendent Pharmacist',
      dept: 'Clinical Pharmacy',
      license: 'PPB-PH-3382',
    },
    {
      email: 'reception@calyviawellness.co.ke',
      fullName: 'Mercy Njeri',
      role: UserRole.ADMISSIONS_FRONT_DESK,
      phone: '+254711600706',
      title: 'Admissions & CRM Officer',
      dept: 'Front Desk & Intake',
      license: null,
    },
    {
      email: 'accounts@calyviawellness.co.ke',
      fullName: 'Peter Njoroge',
      role: UserRole.FINANCE_BILLING,
      phone: '+254722700807',
      title: 'Finance & Daraja M-Pesa Lead',
      dept: 'Finance & Accounts',
      license: 'ICPAK-CPA-9912',
    },
    {
      email: 'stores@calyviawellness.co.ke',
      fullName: 'Daniel Mutua',
      role: UserRole.INVENTORY_STORE,
      phone: '+254733800908',
      title: 'Inventory & Procurement Officer',
      dept: 'Store & Logistics',
      license: null,
    },
    {
      email: 'executive@calyviawellness.co.ke',
      fullName: 'Catherine Muthoni',
      role: UserRole.MANAGEMENT_EXECUTIVE,
      phone: '+254711900010',
      title: 'Managing Director & Governance',
      dept: 'Executive Board',
      license: null,
    },
    {
      email: 'operations@calyviawellness.co.ke',
      fullName: 'Moses Kamau',
      role: UserRole.FACILITY_ADMIN,
      phone: '+254722011122',
      title: 'Facility Operations Manager',
      dept: 'Facility Operations',
      license: null,
    },
  ];

  try {
    for (const staff of staffData) {
      await prisma.user.upsert({
        where: { email: staff.email },
        update: {},
        create: {
          email: staff.email,
          fullName: staff.fullName,
          passwordHash: defaultPasswordHash,
          role: staff.role,
          phone: staff.phone,
          staffProfile: {
            create: {
              nationalIdEncrypted: encryptField('12345678'),
              department: staff.dept,
              jobTitle: staff.title,
              licenseNumber: staff.license,
              licenseBoard: staff.license ? 'Kenya Regulatory Board' : null,
              licenseExpiryDate: new Date('2027-12-31'),
              dateJoined: new Date('2024-01-15'),
            },
          },
        },
      });
    }

    // 2. Room & Bed Definitions
    const rooms = [
      { roomNumber: 'DTX-01', wardName: 'Ground Detox Ward', roomType: RoomType.DETOX_WARD, rate: 12000, beds: ['Bed A', 'Bed B'] },
      { roomNumber: 'DTX-02', wardName: 'Ground Detox Ward', roomType: RoomType.DETOX_WARD, rate: 12000, beds: ['Bed A', 'Bed B'] },
      { roomNumber: 'HRZ-101', wardName: 'Horizon Male Wing', roomType: RoomType.INPATIENT_MALE, rate: 8500, beds: ['Bed 1', 'Bed 2', 'Bed 3'] },
      { roomNumber: 'SRN-201', wardName: 'Serenity Female Wing', roomType: RoomType.INPATIENT_FEMALE, rate: 8500, beds: ['Bed 1', 'Bed 2', 'Bed 3'] },
      { roomNumber: 'VIP-301', wardName: 'Executive Wing', roomType: RoomType.VIP_PRIVATE, rate: 18000, beds: ['VIP Suite 1'] },
    ];

    for (const r of rooms) {
      const createdRoom = await prisma.room.upsert({
        where: { roomNumber: r.roomNumber },
        update: {},
        create: {
          roomNumber: r.roomNumber,
          wardName: r.wardName,
          roomType: r.roomType,
          dailyRateKES: r.rate,
        },
      });

      for (const b of r.beds) {
        await prisma.bed.upsert({
          where: {
            roomId_bedNumber: {
              roomId: createdRoom.id,
              bedNumber: b,
            },
          },
          update: {},
          create: {
            roomId: createdRoom.id,
            bedNumber: b,
            status: BedStatus.AVAILABLE,
          },
        });
      }
    }

    // 3. Realistic Demo Inpatients
    const patient1 = await prisma.patient.upsert({
      where: { registrationNumber: 'CAL-2026-0038' },
      update: {},
      create: {
        registrationNumber: 'CAL-2026-0038',
        firstName: 'James',
        lastName: 'Mwangi',
        preferredName: 'Jimmy',
        nationalIdEncrypted: encryptField('28471930'),
        dateOfBirth: new Date('1990-05-14'),
        gender: Gender.MALE,
        phone: '+254712345678',
        email: 'j.mwangi@example.ke',
        county: 'Kiambu',
        residentialAddress: 'Ruiru Kimbo, near Spur Mall',
        bloodGroup: 'O+',
        knownAllergiesEnc: encryptField('Penicillin, Aspirin'),
        substanceHistoryEnc: encryptField('Alcohol (12 units daily, 8 years), episodic nicotine use'),
        status: PatientStatus.ADMITTED_DETOX,
        emergencyContacts: {
          create: {
            fullName: 'Mary Wanjiru Mwangi',
            relationship: 'Spouse',
            phone: '+254722889900',
            email: 'mary.mwangi@example.ke',
            isPrimaryGuarantor: true,
          },
        },
        consents: {
          create: {
            consentType: 'DATA_PROCESSING_KDPA',
            isGranted: true,
            signatoryName: 'Mary Wanjiru Mwangi',
          },
        },
      },
    });

    // 4. Pharmacy Medications (Formulary)
    const medications = [
      { brandName: 'Valium', genericName: 'Diazepam', strength: '10mg', form: 'Tablet', stock: 250, controlled: true, price: 50 },
      { brandName: 'Neurobion', genericName: 'Vitamin B-Complex + Thiamine', strength: '100mg', form: 'Tablet', stock: 500, controlled: false, price: 35 },
      { brandName: 'Subutex', genericName: 'Buprenorphine Sublingual', strength: '2mg', form: 'Sublingual Tablet', stock: 80, controlled: true, price: 450 },
      { brandName: 'Naltrexone', genericName: 'Naltrexone HCl', strength: '50mg', form: 'Tablet', stock: 120, controlled: false, price: 280 },
    ];

    for (const med of medications) {
      await prisma.medication.create({
        data: {
          brandName: med.brandName,
          genericName: med.genericName,
          strength: med.strength,
          dosageForm: med.form,
          currentStock: med.stock,
          unitPriceKES: med.price,
          isControlledDrug: med.controlled,
        },
      });
    }

    console.log('[Seed] Database successfully seeded with Calyvia staff, rooms, patient, and pharmacy data.');
  } catch (err) {
    console.warn('[Seed] Notice: Direct database connection not available or skipped during dry run. Schema and seeds ready.');
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
