import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DetoxProtocolType, ScoreType, AssessmentSeverity } from '@calyvia/shared';

export class CreateDetoxEpisodeDto {
  @ApiProperty({ example: 'uuid-patient-id' })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiPropertyOptional({ example: 'uuid-admission-id' })
  @IsString()
  @IsOptional()
  admissionId?: string;

  @ApiProperty({ enum: DetoxProtocolType, example: DetoxProtocolType.ALCOHOL_CIWA })
  @IsEnum(DetoxProtocolType)
  protocolType!: DetoxProtocolType;

  @ApiProperty({ example: 'Dr. Kevin Kiprotich' })
  @IsString()
  @IsNotEmpty()
  medicalOfficer!: string;
}

export class RecordWithdrawalAssessmentDto {
  @ApiProperty({ example: 'uuid-detox-episode-id' })
  @IsString()
  @IsNotEmpty()
  detoxEpisodeId!: string;

  @ApiProperty({ enum: ScoreType, example: ScoreType.CIWA_AR })
  @IsEnum(ScoreType)
  scoreType!: ScoreType;

  @ApiProperty({ example: 18 })
  @IsInt()
  @Min(0)
  totalScore!: number;

  @ApiProperty({ enum: AssessmentSeverity, example: AssessmentSeverity.MODERATE })
  @IsEnum(AssessmentSeverity)
  severity!: AssessmentSeverity;

  @ApiProperty({ example: { nausea: 3, tremor: 4, sweats: 3, anxiety: 3, agitation: 2 } })
  parametersJson!: Record<string, any>;

  @ApiProperty({ example: 'Nurse Faith Wangari' })
  @IsString()
  @IsNotEmpty()
  evaluatedBy!: string;
}

export class RecordVitalsDto {
  @ApiProperty({ example: 'uuid-detox-episode-id' })
  @IsString()
  @IsNotEmpty()
  detoxEpisodeId!: string;

  @ApiProperty({ example: 138 })
  @IsInt()
  systolicBP!: number;

  @ApiProperty({ example: 88 })
  @IsInt()
  diastolicBP!: number;

  @ApiProperty({ example: 94 })
  @IsInt()
  pulseRate!: number;

  @ApiProperty({ example: 37.1 })
  @IsNumber()
  temperatureC!: number;

  @ApiProperty({ example: 18 })
  @IsInt()
  respiratoryRate!: number;

  @ApiProperty({ example: 98 })
  @IsInt()
  spO2Percentage!: number;

  @ApiProperty({ example: 'Nurse Faith Wangari' })
  @IsString()
  @IsNotEmpty()
  recordedBy!: string;
}
