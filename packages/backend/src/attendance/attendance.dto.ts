import { IsString, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class CreateAttendanceRecordDto {
  @IsString()
  student_id: string;

  @IsDateString()
  attendance_date: string;

  @IsBoolean()
  is_present: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAttendanceRecordDto {
  @IsOptional()
  @IsDateString()
  attendance_date?: string;

  @IsOptional()
  @IsBoolean()
  is_present?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
