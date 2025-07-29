import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionController } from './mission.controller';
import { MissionService } from './mission.service';
import { Mission } from '../entities/mission.entity';
import { MissionCompletion } from '../entities/mission-completion.entity';
import { Talent } from '../entities/talent.entity';
import { Student } from '../entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mission, MissionCompletion, Talent, Student]),
  ],
  controllers: [MissionController],
  providers: [MissionService],
  exports: [MissionService],
})
export class MissionModule {} 