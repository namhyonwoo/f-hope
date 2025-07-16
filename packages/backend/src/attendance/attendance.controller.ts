import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceRecordDto, UpdateAttendanceRecordDto } from './attendance.dto';

@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post()
  async create(@Request() req, @Body() createAttendanceRecordDto: CreateAttendanceRecordDto) {
    return this.attendanceService.createAttendanceRecord(req.user.userId, createAttendanceRecordDto);
  }

  @Post('upsert-batch')
  async upsertBatch(@Request() req, @Body() records: CreateAttendanceRecordDto[]) {
    return this.attendanceService.upsertAttendanceRecords(req.user.userId, records);
  }

  @Get()
  async findByDate(@Request() req, @Query('date') date: string) {
    return this.attendanceService.findAttendanceRecordsByDate(req.user.userId, date);
  }

  @Get('summary')
  async getSummary(@Request() req, @Query('date') date: string) {
    return this.attendanceService.getAttendanceSummary(req.user.userId, date);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.attendanceService.findOneAttendanceRecord(req.user.userId, id);
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateAttendanceRecordDto: UpdateAttendanceRecordDto) {
    return this.attendanceService.updateAttendanceRecord(req.user.userId, id, updateAttendanceRecordDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.attendanceService.deleteAttendanceRecord(req.user.userId, id);
    return { message: 'Attendance record deleted successfully' };
  }
}
