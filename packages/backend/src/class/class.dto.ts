import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateClassDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  grade?: number;
}

export class UpdateClassDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  grade?: number;
}

export class AssignStudentToClassDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  classId: string;
} 