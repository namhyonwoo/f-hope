import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttendanceRecord } from '../entities/attendance-record.entity';
import { Student } from '../entities/student.entity'; // Import Student entity for relations

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceRecord, Student]), // Register AttendanceRecord and Student entities
  ],
  providers: [AttendanceService],
  controllers: [AttendanceController],
  exports: [AttendanceService],
})
export class AttendanceModule {}
