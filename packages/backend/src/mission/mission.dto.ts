import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class MissionConfigDto {
  @IsEnum(['yes_no', 'count', 'number'])
  type: 'yes_no' | 'count' | 'number';

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  max_value?: number;

  @IsOptional()
  @IsNumber()
  default_value?: number;
}

export class CreateMissionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => MissionConfigDto)
  config: MissionConfigDto;

  @IsNumber()
  talent_reward: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  sort_order?: number;
}

export class UpdateMissionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MissionConfigDto)
  config?: MissionConfigDto;

  @IsOptional()
  @IsNumber()
  talent_reward?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsNumber()
  sort_order?: number;
}

export class MissionCompletionResultDto {
  @IsBoolean()
  completed: boolean;

  @IsOptional()
  value?: number | boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateMissionCompletionDto {
  @IsString()
  student_id: string;

  @IsString()
  mission_id: string;

  @IsString()
  completion_date: string; // YYYY-MM-DD format

  @ValidateNested()
  @Type(() => MissionCompletionResultDto)
  result: MissionCompletionResultDto;
}

export class UpdateMissionCompletionDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => MissionCompletionResultDto)
  result?: MissionCompletionResultDto;
}

export class BulkMissionCompletionDto {
  @IsString()
  student_id: string;

  @IsString()
  completion_date: string; // YYYY-MM-DD format

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MissionCompletionItemDto)
  missions: MissionCompletionItemDto[];
}

export class MissionCompletionItemDto {
  @IsString()
  mission_id: string;

  @ValidateNested()
  @Type(() => MissionCompletionResultDto)
  result: MissionCompletionResultDto;
} 