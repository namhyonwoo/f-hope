import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecord } from '../entities/attendance-record.entity';
import { CreateAttendanceRecordDto, UpdateAttendanceRecordDto } from './attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private attendanceRecordsRepository: Repository<AttendanceRecord>,
  ) {}

  async createAttendanceRecord(userId: string, createAttendanceRecordDto: CreateAttendanceRecordDto): Promise<AttendanceRecord> {
    const attendanceDate = new Date(createAttendanceRecordDto.attendance_date);
    if (attendanceDate.getDay() !== 0) { // 0 = Sunday
      throw new BadRequestException('Attendance can only be recorded on Sundays.');
    }

    const newRecord = this.attendanceRecordsRepository.create({
      ...createAttendanceRecordDto,
      user_id: userId,
    });
    return this.attendanceRecordsRepository.save(newRecord);
  }

  async findAttendanceRecordsByDate(userId: string, date: string): Promise<AttendanceRecord[]> {
    return this.attendanceRecordsRepository.find({
      where: { user_id: userId, attendance_date: new Date(date) },
      relations: ['student'], // Load student details
    });
  }

  async findOneAttendanceRecord(userId: string, id: string): Promise<AttendanceRecord> {
    const record = await this.attendanceRecordsRepository.findOne({ where: { id, user_id: userId } });
    if (!record) {
      throw new NotFoundException('Attendance record not found');
    }
    return record;
  }

  async updateAttendanceRecord(userId: string, id: string, updateAttendanceRecordDto: UpdateAttendanceRecordDto): Promise<AttendanceRecord> {
    const record = await this.findOneAttendanceRecord(userId, id); // Ensure record belongs to user

    if (updateAttendanceRecordDto.attendance_date) {
      const newAttendanceDate = new Date(updateAttendanceRecordDto.attendance_date);
      if (newAttendanceDate.getDay() !== 0) { // 0 = Sunday
        throw new BadRequestException('Attendance date can only be updated to a Sunday.');
      }
    }

    await this.attendanceRecordsRepository.update(id, updateAttendanceRecordDto);
    return this.findOneAttendanceRecord(userId, id);
  }

  async deleteAttendanceRecord(userId: string, id: string): Promise<void> {
    await this.findOneAttendanceRecord(userId, id); // Ensure record belongs to user
    await this.attendanceRecordsRepository.delete(id);
  }

  async upsertAttendanceRecords(userId: string, records: CreateAttendanceRecordDto[]): Promise<AttendanceRecord[]> {
    const savedRecords: AttendanceRecord[] = [];
    for (const recordDto of records) {
      const attendanceDate = new Date(recordDto.attendance_date);
      if (attendanceDate.getDay() !== 0) { // 0 = Sunday
        throw new BadRequestException('Attendance can only be recorded on Sundays.');
      }

      // Check if a record for this student and date already exists
      let existingRecord = await this.attendanceRecordsRepository.findOne({
        where: {
          student_id: recordDto.student_id,
          attendance_date: attendanceDate,
          user_id: userId,
        },
      });

      if (existingRecord) {
        // Update existing record
        existingRecord.is_present = recordDto.is_present;
        existingRecord.notes = recordDto.notes || '';
        savedRecords.push(await this.attendanceRecordsRepository.save(existingRecord));
      } else {
        // Create new record
        const newRecord = this.attendanceRecordsRepository.create({
          ...recordDto,
          user_id: userId,
        });
        savedRecords.push(await this.attendanceRecordsRepository.save(newRecord));
      }
    }
    return savedRecords;
  }

  async getAttendanceSummary(userId: string, date: string): Promise<{ totalStudents: number; presentToday: number }> {
    const totalStudents = await this.attendanceRecordsRepository.count({
      where: { user_id: userId },
    });

    const presentToday = await this.attendanceRecordsRepository.count({
      where: { user_id: userId, attendance_date: new Date(date), is_present: true },
    });

    return { totalStudents, presentToday };
  }
}
