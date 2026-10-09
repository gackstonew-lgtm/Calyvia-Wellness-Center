import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClinicalNoteType } from '@calyvia/shared';

export class CreateClinicalNoteDto {
  @ApiProperty({ example: 'uuid-patient-id' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiPropertyOptional({ example: 'uuid-admission-id' })
  @IsString()
  @IsOptional()
  admissionId?: string;

  @ApiProperty({ enum: ClinicalNoteType, example: ClinicalNoteType.PSYCHIATRIC_EVALUATION })
  @IsEnum(ClinicalNoteType)
  noteType!: ClinicalNoteType;

  @ApiProperty({ example: 'Patient reports persistent insomnia, severe tremors in morning' })
  @IsString()
  @IsNotEmpty()
  subjective!: string;

  @ApiProperty({ example: 'BP: 142/90, Pulse: 98 bpm, Tremor +++, Sweats ++, Alert & Oriented x3' })
  @IsString()
  @IsNotEmpty()
  objective!: string;

  @ApiProperty({ example: 'Severe Alcohol Dependence with Active Withdrawal (CIWA 18)' })
  @IsString()
  @IsNotEmpty()
  assessment!: string;

  @ApiProperty({ example: 'Commence Diazepam taper: 10mg PO QDS x 48h, Thiamine 100mg IV OD, fluid resuscitation' })
  @IsString()
  @IsNotEmpty()
  plan!: string;

  @ApiPropertyOptional({ example: 'F10.232 (Alcohol dependence with withdrawal state)' })
  @IsString()
  @IsOptional()
  icd10Diagnosis?: string;
}
