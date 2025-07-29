import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClassService } from './class.service';
import { CreateClassDto, UpdateClassDto, AssignStudentToClassDto } from './class.dto';

@UseGuards(JwtAuthGuard)
@Controller('classes')
export class ClassController {
  constructor(private classService: ClassService) {}

  @Post()
  async create(@Request() req, @Body() createClassDto: CreateClassDto) {
    return this.classService.createClass(req.user.userId, createClassDto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.classService.findAllClasses(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.classService.findOneClass(req.user.userId, id);
  }

  @Get(':id/students')
  async getClassWithStudents(@Request() req, @Param('id') id: string) {
    return this.classService.getClassWithStudents(req.user.userId, id);
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classService.updateClass(req.user.userId, id, updateClassDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.classService.deleteClass(req.user.userId, id);
    return { message: '반이 삭제되었습니다.' };
  }

  @Post('assign-student')
  async assignStudentToClass(@Request() req, @Body() assignDto: AssignStudentToClassDto) {
    return this.classService.assignStudentToClass(req.user.userId, assignDto);
  }

  @Delete('remove-student/:studentId')
  async removeStudentFromClass(@Request() req, @Param('studentId') studentId: string) {
    return this.classService.removeStudentFromClass(req.user.userId, studentId);
  }
} 